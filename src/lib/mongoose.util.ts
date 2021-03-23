import mongoose from 'mongoose';
import validator from 'validator';
import DataDomain from '../enums/DataDomain';
import ModelStatus from '../enums/ModelStatus';
import AppException from '../exceptions/AppException';
import IRowLevelUserSecurity from '../interfaces/models/IRowLevelUserSecurity';
import enumUtil from './enum.util';
import security from './security.util';
import { HoldingOrgDataAttributeConfig } from '../models/org/holding-org.types'
import { DataAttributeProviderType } from '../models/system/system-config.types';
import _ from 'lodash'

const modelStatusArray = enumUtil.toArray(ModelStatus)


export const DEFAULT_MODEL_OPTIONS = {
  timestamps: true
}


export type CodeSchemaOptions = {
  required?: boolean,
  isUnique?: boolean
  isUniqueFn: Function,
}
/**
 *
 * @param opts Only set isUnique if there is no compound unique key
 */
export function codeSchema(opts: CodeSchemaOptions) {
  const { required = true, isUnique = false, isUniqueFn } = opts
  return {
    type: String,
    required: required,
    unique: isUnique,
    uppercase: true,

    validate: [
      {
        validator: function (code: any) {
          let codeAlphanum = code.replace(/-/g, '');
          codeAlphanum = codeAlphanum.replace(/_/g, '');
          return validator.isAlphanumeric(codeAlphanum);
        },
        message: (props: any) => `Code ${props.value} contains special characters`,
        type: 'format'
      },
      {
        validator: function (code: any) { return isUniqueFn(this, code) },
        message: (props: any) => `Code ${props.value} is already in use`,
        type: 'unique'
      }
    ]
  }
}



export async function isUnique(model: mongoose.Model<any>, doc: any, query: any = {}): Promise<boolean> {
  const docFromDb = await model.findOne(query)
  const exists = !!docFromDb
  return !exists || (doc && docFromDb && doc._id.equals(docFromDb._id))
}



export type EmailSchemaOptions = {
  required?: boolean,
  emailValidation?: {
    allowDisplayName?: boolean
  }
  isUnique?: boolean,
  isUniqueFn?: Function
}
/**
 *
 * @param opts required: boolean: unique: boolean
 * @param isUnique If opts.unique = true then you will have to pass this function
 */
export function emailSchema(opts: EmailSchemaOptions = {}): any {
  const { required = false, emailValidation = {}, isUnique = false, isUniqueFn } = opts
  const { allowDisplayName = false } = emailValidation;

  return {
    type: String,
    required: required,
    unique: isUnique,
    lowercase: allowDisplayName ? false : true, //it needs to be possible to have proper capitalization for display name
    validate: [
      {
        validator: (v: any) => {
          let isValid = false;
          if (required) {
            isValid = validator.isEmail(v, { allow_display_name: allowDisplayName });
          } else {
            isValid = v ? validator.isEmail(v, { allow_display_name: allowDisplayName }) : v === null || v === ''
          }

          return isValid;
        },
        message: (props: any) => `${props.value} is not a valid email address`,
        type: 'format'
      },
      {
        validator: function (email: any) { return isUniqueFn ? isUniqueFn(this, email) : true },
        message: (props: any) => `Email ${props.value} is already in use`,
        type: 'unique'
      }
    ]
  }
}



/**
 * The standard status schema with 0 - inactive, 1 - active.
 */
export function statusSchema() {
  return {
    type: Number,
    enum: modelStatusArray,
    default: ModelStatus.ACTIVE,
    required: true
  }
}




/**
 * Use this to get the filter data that can be used in drop downs, etc.
 * @deprecated
 * @param model
 * @param fieldNames
 * @param userSecurity
 * @deprecated Not maintained anymore
 */
export async function getSearchFilterDataBasedOnModelDefinition(model: mongoose.Model<any>, fieldNames: Array<string>, dataDomain: DataDomain, userSecurity: IRowLevelUserSecurity) {

  //1 - get model attribute definitions
  const searchFilterData = getMongooseModelAttributes(model, fieldNames);

  //2 - define where we need to query the db to get filter data
  //essentially we dont want db unique values for anything that has data already through enums
  //or for dates and numbers
  let fieldNamesForFilterData: Array<string> = [];
  Object.keys(searchFilterData).forEach(function (key) {
    const attribute = searchFilterData[key];

    if ((!attribute.data || attribute.data.length == 0) && !['Date', 'Number'].includes(attribute.type)) {
      fieldNamesForFilterData.push(key);
    }
  });


  //3 - get unique data
  const filterData = await getUniqeFilterValues(model, fieldNamesForFilterData, dataDomain, userSecurity);

  Object.keys(filterData).forEach(function (key) {
    searchFilterData[key].data = filterData[key]
  });

  return searchFilterData;
}




/**
 * Retrives uniqe data for provided model and dataAttributes. Dynamic data is only retrieved if dataAttributes.dataProviderType === DataAttributeProviderType.DYNAMIC
 * @param model
 * @param dataAttributes
 * @param dataDomain
 * @param userSecurity
 */
export async function getSearchFilterDataBasedOnHoldingOrgConfig(model: mongoose.Model<any>, dataAttributes: HoldingOrgDataAttributeConfig[], dataDomain: DataDomain, userSecurity: IRowLevelUserSecurity): Promise<HoldingOrgDataAttributeConfig[]> {
  const newDataAttributes: HoldingOrgDataAttributeConfig[] = []

  //tuple storing attributeName and array index
  const dynamicDataProviderAttributes: Array<[string, number]> = []

  let i = 0
  for (let dataAttribute of dataAttributes) {
    //we're going to manipulate the dataAttributes -- that's why I am cloning the original objects
    newDataAttributes.push(_.cloneDeep(dataAttribute));

    if (dataAttribute.useInCampaignFilter && dataAttribute.dataProviderType === DataAttributeProviderType.DYNAMIC) {
      //right now, the campaign filter is the only place where the search filter data is used.
      //if this changes in the future, this will have to be revisited

      //storing attributeName (code) and index for later use
      dynamicDataProviderAttributes.push([dataAttribute.code, i])
    }
    i++;
  }

  //getUniqeFilterValues expects a simple string[]
  const fieldNamesForFilterData = dynamicDataProviderAttributes.map(v => {
    //returning the attribute code (=internal attributeName)
    return v[0];
  })

  //get unique data from database for each of the identified fields
  //The result is an object that has each attributeName as object key
  const filterDataObject = await getUniqeFilterValues(model, fieldNamesForFilterData, dataDomain, userSecurity);

  //add the uniqe data to our result list
  for (let dataAttribute of dynamicDataProviderAttributes) {
    const code = dataAttribute[0]
    const index = dataAttribute[1]

    //set the data attribute to the
    newDataAttributes[index].data = filterDataObject[code]
  }

  return newDataAttributes;
}









/**
 * Retrieves unique values for the specified mongoose model fieldNames by honoring userSecurity
 * Returns an object of the following structure {city: ['Berlin', 'Channai'], zip: ['1231321']}
 * @param model
 * @param fieldNames
 * @param userSecurity
 */
export async function getUniqeFilterValues(model: mongoose.Model<any>, fieldNames: Array<string>, dataDomain: DataDomain, userSecurity: IRowLevelUserSecurity): Promise<any> {
  /*
  build up something like this...

  let filterData = await Customer.aggregate([{
    $group: {
      _id: null,
      country: {$addToSet: '$country'},
      memberOrg: {$addToSet: '$memberOrg'},
      holdingOrg: {$addToSet: '$holdingOrg'}
    }
  }]);
  */

  const aggregation = [];

  const queryRestriction = security.buildAccessQuery(dataDomain, userSecurity);

  if (queryRestriction !== null) {
    aggregation.push({ $match: queryRestriction });
  }

  const group: any = { _id: null }; //_id always has to be added, see mongoose documentation
  fieldNames.forEach((fieldName) => {
    group[fieldName] = { $addToSet: `$${fieldName}` }
  });
  aggregation.push({ $group: group });

  let filterData: any = await model.aggregate(aggregation);

  if (filterData.length > 0) {
    //cleanup [some of those steps can maybe be done in mongoose/mongodb. This needs to be checked.]
    //1 - flatten object -- it's an array
    filterData = filterData[0]

    //2 - remove _id -- that's null anyway and doesnt make sense in this scenario
    delete filterData._id

    //3 - remove null from arrays and sort
    Object.keys(filterData).forEach(function (key) {
      filterData[key] = filterData[key].filter((obj: any) => obj).sort();
    })
  }

  return filterData;
}

/**
 *
 * @param model
 * @param fieldNames
 * @deprecated Not maintained anymore
 */
export function getMongooseModelAttributes(model: mongoose.Model<any>, fieldNames: Array<string>): any {
  const searchSchema: any = {};
  const schemaPaths = <any>model.schema.paths

  //********note: this doesnt necessarily have to be dynamic. We could also just hardcode this instead of using the mongoose definition.
  //depends on if we're going to reuse this or not.
  fieldNames.forEach((fieldName) => {

    if (schemaPaths[fieldName]) {
      const type = schemaPaths[fieldName].instance

      let enumValues = schemaPaths[fieldName].enumValues;
      if (type === 'Number') {
        enumValues = schemaPaths[fieldName].options.enum
      }

      searchSchema[fieldName] = {};
      searchSchema[fieldName].type = type;
      if (enumValues) {
        enumValues = enumValues.filter((v: any) => {
          //filter empty items
          return (typeof v !== 'string' && v !== null)
            || (typeof v === 'string' && v !== null && v !== '');
        });
        searchSchema[fieldName].data = enumValues;
      }

    } else {
      throw new AppException("Internal server error", `Field does not exist ${fieldName}`)
    }

  });

  return searchSchema;
};

export function stringSchema(opts: { required?: boolean, defaultValue?: any } = {}) {
  const { required, defaultValue } = opts
  return {
    type: String,
    required: !!required,
    default: defaultValue
  }
}

export function intSchema(opts: { required?: boolean, defaultValue?: any } = {}) {
  const { required, defaultValue } = opts

  return {
    type: Number,
    required: !!required,
    default: defaultValue
    //TODO: add integer validation -- be mindful that it also can be empty if not required
  }
}




/**
 * If record is an object with _id attribute, it will return toString value of _id attribute.
 * Otherwise, it will return the record itself (which should be a string)
 * @param org
 */
export function extractId(record: any): string | undefined {
  let id
  if (record) {
    if (record._id) {
      id = record._id.toString()
    } else {
      id = record
    }
  }

  return id;
}

/**
 * Converts a String Enum into an array. The resulting mongoose schema will use the resulting array in the "enum" attribute.
 * @param e String Enum
 * @param opts
 */
export function stringEnumSchema(e: { [s: number]: string }, opts: { required?: boolean, defaultValue?: any, stringArray?: boolean } = {}) {
  const { required, defaultValue, stringArray } = opts
  return {
    type: stringArray ? [String] : String,
    enum: enumUtil.toArray(e),
    required: !!required,
    default: defaultValue
  }
}
