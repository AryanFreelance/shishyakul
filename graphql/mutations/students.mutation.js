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
    $password: String!
    $phone: String!
    $ay: String!
    $grade: String!
    $verificationCode: String!
  ) {
    createStudent(
      firstname: $firstname
      middlename: $middlename
      lastname: $lastname
      email: $email
      password: $password
      phone: $phone
      ay: $ay
      grade: $grade
      verificationCode: $verificationCode
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
    $ay: String!
    $newAy: String
    $grade: String!
    $newGrade: String
    $batch: String
    $studentInformation: StudentInformationInput
    $guardianInformation: GuardianInformationInput
    $siblingInformation: [SiblingInformationInput]
    $parentSection: ParentSectionInformationInput
    $studentSection: StudentSectionInformationInput
  ) {
    updateStudent(
      userId: $userId
      firstname: $firstname
      middlename: $middlename
      lastname: $lastname
      phone: $phone
      ay: $ay
      newAy: $newAy
      grade: $grade
      newGrade: $newGrade
      batch: $batch
      studentInformation: $studentInformation
      guardianInformation: $guardianInformation
      siblingInformation: $siblingInformation
      parentSection: $parentSection
      studentSection: $studentSection
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
  mutation DeleteStudent($ay: String!, $grade: String!, $userId: ID!) {
    deleteStudent(ay: $ay, grade: $grade, userId: $userId)
  }
`;

// Delete Students in Bulk
export const DELETE_STUDENTS_IN_BULK = gql`
  mutation DeleteStudentsInBulk($emails: [String]!) {
    bulkDeleteTempStudents(emails: $emails)
  }
`;
