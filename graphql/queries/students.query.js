import { gql } from "@apollo/client";

// Get Temp Students
export const GET_TEMP_STUDENTS = gql`
  query TempStudents {
    tempStudents {
      email
      verificationCode
    }
  }
`;

// Get Students for Dashboard
export const DASHBOARD_GET_STUDENT = gql`
  query Students {
    students {
      userId
      email
      firstname
      middlename
      lastname
      phone
      grade
      attendance {
        present
        absent
      }
    }
  }
`;

// Get Student Details
export const GET_STUDENT_DETAILS = gql`
  query Student($userId: ID!) {
    student(userId: $userId) {
      userId
      email
      firstname
      middlename
      lastname
      phone
      grade
      attendance {
        present
        absent
      }
      fees {
        userId
        id
        email
        feesPaid
        paidOn
        month
        year
        createdAt
      }
    }
  }
`;

// Get Student Profile Information
export const GET_STUDENT_PROFILE = gql`
  query Student($userId: ID!) {
    student(userId: $userId) {
      email
      firstname
      middlename
      lastname
      phone
      grade
      guardianInformation {
        motherFirstName
        motherMiddleName
        motherLastName
        motherOccupation
        motherDesignation
        motherExServiceWomen
        motherContactNumber
        fatherFirstName
        fatherMiddleName
        fatherLastName
        fatherOccupation
        fatherDesignation
        fatherExServiceMen
        fatherContactNumber
      }
      siblingInformation {
        siblingName
        age
        status
        organization
      }
      studentInformation {
        dob
        age
        gender
        adhaar
        address
        school
        board
        medium
      }
    }
  }
`;
