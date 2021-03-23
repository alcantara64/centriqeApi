import ModelStatus from "../../enums/ModelStatus";
import { CustomerDocument, UnsubscribeRecordNoStatus, CustomerMessagingUnsubscribe, CustomerMessagingValidity } from "./customer.types";
import { extractId } from '../../lib/mongoose.util'
import { MessageChannel } from "../message/message.types";



/**
 * Checks if the customer has unsubscribed
 * @param unsubscribeRecord
 */
export function isUnsubscribed(this: CustomerDocument, unsubscribeRecord: UnsubscribeRecordNoStatus): boolean {
  const { unsubscribeList } = this;

  const { holdingOrg, memberOrg } = unsubscribeRecord
  //holdingOrg or memberOrg could be full objects with _id ObjectId attribute
  let holdingOrgId = extractId(holdingOrg)
  let memberOrgId = extractId(memberOrg)

  let result = unsubscribeList.some(v => {
    return v.channel === unsubscribeRecord.channel
      && v.dataDomain === unsubscribeRecord.dataDomain
      && (v.holdingOrg === holdingOrgId || v.memberOrg == memberOrgId)
      && v.status === ModelStatus.ACTIVE
  });


  const unsubChannel = this.messaging?.channel
  if(unsubChannel) {
    const channelData = <CustomerMessagingUnsubscribe | undefined>unsubChannel[unsubscribeRecord.channel]
    const isUnsubscribed = channelData?.isUnsubscribed
    if(isUnsubscribed !== undefined) {
      result = result && isUnsubscribed
    }

  }

  return result;
}

/**
 * Checkis if the recipient address for the given channel is valid
 * If not set, we assume it's valid
 * @param this
 * @param channel
 */
export function isRecipientValid(this: CustomerDocument, channel: MessageChannel): boolean {
  const messaging = this.messaging
  let isValid = true
  if(messaging) {
    const recipientValidity: CustomerMessagingValidity = (<any>messaging)[channel]
    if(recipientValidity && recipientValidity.isValid !== undefined) {
      isValid = recipientValidity.isValid
    }
  }

  return isValid;

}



