import { gql } from "@apollo/client";

// Get all birthdays
export const GET_BIRTHDAYS = gql`
  query Birthdays($ay: String) {
    birthdays(ay: $ay) {
      userId
      firstname
      lastname
      dob
      email
      grade
      ay
      batch
    }
  }
`;

// Get today's birthdays
export const GET_TODAYS_BIRTHDAYS = gql`
  query TodaysBirthdays {
    todaysBirthdays {
      today {
        userId
        firstname
        lastname
        dob
        email
        grade
        ay
        batch
      }
      upcoming {
        userId
        firstname
        lastname
        dob
        email
        grade
        ay
        batch
      }
    }
  }
`;

// Get upcoming birthdays with a limit
export const GET_UPCOMING_BIRTHDAYS = gql`
  query UpcomingBirthdays($limit: Int) {
    upcomingBirthdays(limit: $limit) {
      userId
      firstname
      lastname
      dob
      email
      grade
      ay
      batch
    }
  }
`;

// Get birthdays by month
export const GET_BIRTHDAYS_BY_MONTH = gql`
  query StudentsBirthdaysByMonth($month: Int, $ay: String) {
    studentsBirthdaysByMonth(month: $month, ay: $ay) {
      userId
      firstname
      lastname
      dob
      email
      grade
      ay
      batch
    }
  }
`; 