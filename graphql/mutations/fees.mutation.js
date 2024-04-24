import { gql } from "@apollo/client";

export const CREATE_FEE = gql`
  mutation CREATE_FEE(
    $userId: ID!
    $email: String!
    $feesPaid: Int!
    $paidOn: String!
    $month: String!
    $year: String!
  ) {
    createFee(
      userId: $userId
      email: $email
      feesPaid: $feesPaid
      paidOn: $paidOn
      month: $month
      year: $year
    ) {
      userId
      createdAt
      email
      feesPaid
      month
      paidOn
      year
      id
    }
  }
`;

export const DELETE_FEES_USERS = gql`
  mutation DeleteFeeUsers($userId: ID!) {
    deleteUserFees(userId: $userId) {
      message
      success
    }
  }
`;
