

/**
 * Any Mongoose Model that is secured by holdingOrg or memberOrg needs to use this
 */
interface IRowLevelSecurityData {
  //TODO: evaludate if undefined (?) can be removed
  holdingOrgId?: string | null,
  memberOrgId?: string | null
}

export default IRowLevelSecurityData
