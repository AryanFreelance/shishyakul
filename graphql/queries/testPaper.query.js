import { gql } from "@apollo/client";

// Get Test Papers
export const GET_TESTPAPERS = gql`
  query Testpapers {
    testpapers {
      draft {
        id
        title
        subject
        totalMarks
        date
        sharedWith
        url
        createdAt
        published
      }
      published {
        id
        title
        subject
        totalMarks
        date
        sharedWith
        url
        createdAt
        published
      }
    }
  }
`;

// Get a Test Paper
export const GET_TESTPAPER = gql`
  query Testpaper($id: ID!, $published: Boolean!) {
    testpaper(id: $id, published: $published) {
      id
      title
      subject
      totalMarks
      date
      sharedWith
      url
      createdAt
      published
    }
  }
`;

// Get Published Test Papers
export const GET_PUBLISHED_TESTPAPERS = gql`
  query Testpapers {
    testpapers {
      published {
        id
        title
        subject
        totalMarks
        date
        sharedWith
        url
        createdAt
        published
      }
    }
  }
`;

// Get Published Test Papers SharedWith (Secure)
export const GET_PUBLISHED_TESTPAPERS_SECURE = gql`
  query Testpapers {
    testpapers {
      published {
        id
        title
        createdAt
        sharedWith
      }
    }
  }
`;

// Get Test Papers for the User
export const GET_PUBLISHED_TESTPAPERS_USERS = gql`
  query TestpaperUsers($id: ID!) {
    testpaperUsers(id: $id) {
      id
      title
      subject
      createdAt
      date
      totalMarks
      url
    }
  }
`;
