import { gql } from "@apollo/client";

// Create a fee
export const CREATE_FEE = gql`
  mutation CreateFee(
    $id: ID
    $userId: String
    $email: String
    $feesPaid: Int
    $paidOn: String
    $month: String
    $year: String
    $mode: String
    $upiId: String
    $upiImgUrl: String
    $chequeRefNo: String
    $chequeImgUrl: String
    $neftRefNo: String
    $academicYear: String
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
      neftRefNo: $neftRefNo
      academicYear: $academicYear
    )
  }
`;

export const UPDATE_FEE = gql`
  mutation UpdateFee($id: ID, $userId: String, $remark: String, $academicYear: String) {
    updateFee(id: $id, userId: $userId, remark: $remark, academicYear: $academicYear)
  }
`;

// Delete a Fee
export const DELETE_FEE = gql`
  mutation DELETE_FEE($userId: ID, $deleteFeeId: ID, $academicYear: String) {
    deleteFee(userId: $userId, id: $deleteFeeId, academicYear: $academicYear)
  }
`;

// Update Student Total Fees
export const UPDATE_STUDENT_TOTAL_FEES = gql`
  mutation UpdateStudentTotalFees($userId: ID!, $totalFees: Int!, $academicYear: String) {
    updateStudentTotalFees(userId: $userId, totalFees: $totalFees, academicYear: $academicYear)
  }
`;
