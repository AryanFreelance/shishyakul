import { gql } from "@apollo/client";

export const DELETE_STUDENT = gql`
  mutation DeleteStudent($userId: ID!) {
    deleteStudent(userId: $userId) {
      message
      success
    }
  }
`;

// Temp Student
export const CreateTempStudent = gql`
  mutation CreateTempStudent($email: ID!, $verificationCode: String!) {
    createTempStudent(email: $email, verificationCode: $verificationCode) {
      message
      success
    }
  }
`;

export const DELETE_TEMP_STUDENT = gql`
  mutation DELETE_TEMP_STUDENT($email: ID!) {
    deleteTempStudent(email: $email) {
      message
      success
    }
  }
`;
