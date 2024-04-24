import { gql } from "@apollo/client";

export const GET_STUDENTS = gql`
  query GET_STUDENTS {
    students {
      userId
      firstname
      lastname
      email
      phone
      grade
      attendance {
        present
        absent
      }
    }
  }
`;

export const GET_STUDENT = gql`
  query GetStudent($userId: ID!) {
    student(userId: $userId) {
      userId
      phone
      firstname
      middlename
      lastname
      grade
      fees {
        id
        createdAt
        email
        feesPaid
        month
        paidOn
        userId
        year
      }
      email
      attendance {
        present
        absent
      }
      testPaper
      testPaperData {
        id
        createdAt
        title
        date
        subject
        totalMarks
        url
      }
    }
  }
`;

// Temp Student
export const GET_TEMP_STUDENTS_QUERY = gql`
  query GET_TEMP_STUDENTS_QUERY {
    tempStudents {
      email
      verificationCode
    }
  }
`;
