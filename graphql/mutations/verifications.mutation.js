import { gql } from "@apollo/client";

export const CreateVerification = gql`
  mutation CreateVerification($studentEmail: String!) {
    createVerification(studentEmail: $studentEmail) {
      code
      message
      success
    }
  }
`;

export const DELETE_VERIFICATIONS = gql`
  mutation DELETE_VERIFICATIONS($verificationCode: ID!) {
    deleteVerification(verificationCode: $verificationCode) {
      message
      success
    }
  }
`;
