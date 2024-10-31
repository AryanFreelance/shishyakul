import { gql } from "@apollo/client";

// Get Academic Years
export const GET_ACADEMIC_YEARS = gql`
  query GetAcademicYears {
    academicYears
  }
`;

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
  query Students($ay: String!, $grade: String) {
    students(ay: $ay, grade: $grade) {
      userId
      email
      firstname
      middlename
      lastname
      phone
      ay
      grade
      batch
      attendance {
        present
        absent
      }
    }
  }
`;

// Get Student Information
export const GET_STUDENT_INFO = gql`
  query StudentInfo($userId: ID!) {
    studentInfo(userId: $userId) {
      userId
      firstname
      lastname
      email
      ay
      grade
    }
  }
`;

// Get Student Details
export const GET_STUDENT_DETAILS = gql`
  query Student($ay: String!, $grade: String!, $userId: ID!) {
    student(ay: $ay, grade: $grade, userId: $userId) {
      userId
      email
      firstname
      middlename
      lastname
      phone
      ay
      grade
      batch
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
        mode
        upiId
        upiImgUrl
        chequeRefNo
        chequeImgUrl
        remark
      }
    }
  }
`;

// Get Student Profile Information
export const GET_STUDENT_PROFILE = gql`
  query Student($ay: String!, $grade: String!, $userId: ID!) {
    student(ay: $ay, grade: $grade, userId: $userId) {
      email
      firstname
      middlename
      lastname
      phone
      ay
      grade
      batch
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

// Get Students for Attendance Marking
export const GET_STUDENTS_FOR_ATTENDANCE = gql`
  query GStudents($ay: String!, $grade: String!) {
    gStudents(ay: $ay, grade: $grade) {
      userId
      firstname
      middlename
      lastname
      email
      ay
      grade
      batch
    }
  }
`;
