import { gql } from "@apollo/client";

// Create, Update, Delete on Students

// Initialize a new Student
export const INITIALIZE_STUDENT = gql`
  mutation InitializeStudent($email: String!) {
    initializeStudent(email: $email)
  }
`;

// Create a new Student
export const CREATE_STUDENT = gql`
  mutation CreateStudent(
    $firstname: String!
    $middlename: String!
    $lastname: String!
    $email: String!
    $phone: String!
    $grade: String!
    $verificationCode: String!
    $password: String!
  ) {
    createStudent(
      firstname: $firstname
      middlename: $middlename
      lastname: $lastname
      email: $email
      phone: $phone
      grade: $grade
      verificationCode: $verificationCode
      password: $password
    )
  }
`;

// Update Student Details
export const UPDATE_STUDENT = gql`
  mutation UpdateStudent(
    $userId: ID!
    $firstname: String
    $middlename: String
    $lastname: String
    $phone: String
    $grade: String
    $studentInformation: StudentInformationInput
    $guardianInformation: GuardianInformationInput
    $siblingInformation: [SiblingInformationInput]
  ) {
    updateStudent(
      userId: $userId
      firstname: $firstname
      middlename: $middlename
      lastname: $lastname
      phone: $phone
      grade: $grade
      studentInformation: $studentInformation
      guardianInformation: $guardianInformation
      siblingInformation: $siblingInformation
    )
  }
`;

// Delete Temp Student
export const DELETE_TEMP_STUDENT = gql`
  mutation DeleteTempStudent($email: String!) {
    deleteTempStudent(email: $email)
  }
`;

// Delete a Student
export const DELETE_STUDENT = gql`
  mutation DeleteStudent($userId: ID!) {
    deleteStudent(userId: $userId)
  }
`;
