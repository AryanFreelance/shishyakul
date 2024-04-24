import { gql } from "@apollo/client";

export const GET_VERIFICATIONS = gql`
  query GET_VERIFICATIONS {
    verifications {
      verificationCode
      studentEmail
      expired
    }
  }
`;
