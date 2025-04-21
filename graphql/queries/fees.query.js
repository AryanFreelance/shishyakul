import { gql } from "@apollo/client";

// Get student fees for a specific academic year
export const GET_STUDENT_FEES = gql`
  query StudentFees($userId: ID, $academicYear: String) {
    studentFees(userId: $userId, academicYear: $academicYear) {
      userId
      id
      email
      feesPaid
      paidOn
      month
      year
      createdAt
      mode
      upiId
      upiImgUrl
      chequeRefNo
      chequeImgUrl
      remark
      academicYear
    }
  }
`;

// Get all fees for a student across all academic years
export const GET_STUDENT_ALL_FEES = gql`
  query StudentAllFees($userId: ID) {
    studentAllFees(userId: $userId) {
      userId
      id
      email
      feesPaid
      paidOn
      month
      year
      createdAt
      mode
      upiId
      upiImgUrl
      chequeRefNo
      chequeImgUrl
      remark
      academicYear
    }
  }
`; 