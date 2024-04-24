import { gql } from "@apollo/client";

export const GET_TESTPAPERS = gql`
  query GET_TESTPAPERS {
    testpapers {
      id
      createdAt
      title
      url
    }
  }
`;

export const GET_TEST_PAPER = gql`
  query GET_TEST_PAPER($testpaperId: ID!) {
    testpaper(id: $testpaperId) {
      createdAt
      date
      id
      sharedWith
      subject
      title
      totalMarks
      url
    }
  }
`;
