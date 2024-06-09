import { gql } from "@apollo/client";

// Create a fee
export const CREATE_FEE = gql`
  # mutation CreateFee(
  #   $userId: ID!
  #   $email: String!
  #   $feesPaid: Int!
  #   $paidOn: String!
  #   $month: String!
  #   $year: String!
  # ) {
  #   createFee(
  #     userId: $userId
  #     email: $email
  #     feesPaid: $feesPaid
  #     paidOn: $paidOn
  #     month: $month
  #     year: $year
  #   )
  # }
  mutation CreateFee(
    $id: ID!
    $userId: String!
    $email: String!
    $feesPaid: Int!
    $paidOn: String!
    $month: String!
    $year: String!
    $mode: String!
    $upiId: String
    $upiImgUrl: String
    $chequeRefNo: String
    $chequeImgUrl: String
  ) {
    createFee(
      id: $id
      userId: $userId
      email: $email
      feesPaid: $feesPaid
      paidOn: $paidOn
      month: $month
      year: $year
      mode: $mode
      upiId: $upiId
      upiImgUrl: $upiImgUrl
      chequeRefNo: $chequeRefNo
      chequeImgUrl: $chequeImgUrl
    )
  }
`;

// Delete a Fee
export const DELETE_FEE = gql`
  mutation DELETE_FEE($userId: ID!, $deleteFeeId: ID!) {
    deleteFee(userId: $userId, id: $deleteFeeId)
  }
`;
