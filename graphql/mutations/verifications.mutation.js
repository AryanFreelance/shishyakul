import { gql } from "@apollo/client";

// Verify Verification Code
export const VERIFY_CODE = gql`
  query VerifyStudentCode($verificationCode: ID!) {
    verifyStudentCode(verificationCode: $verificationCode)
  }
`;
