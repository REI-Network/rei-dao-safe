import { gql } from "@apollo/client";

export const queryMaps = {
  ["validator"]: gql`
    query validators($blockHeight: String) {
      validators(where:{id:$blockHeight}){
        id,
        Validator(orderBy: votingPower, orderDirection: desc){
          id
          address
          votingPower
          commissionRate
          commissionAddress
          active
        }
      }
    }
  `,
  ["unstakeList"]: gql`
    query unStakeInfos($address: String) {
      unStakeInfos(where: { to: $address }) {
          id
          from
          to
          txHash
          values
          shares
          validator
          timestamp
          state
          amount
      }
    }
  `,
  ["mystakeList"]: gql`
    query stakeInfos($address: String)  {
        stakeInfos(where: { to: $address }) {
            id
            from
            to
            timestamp
            validator
        }
    }
  `
}
