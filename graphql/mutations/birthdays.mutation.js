import { gql } from "@apollo/client";

// Update birthday notification status
export const UPDATE_BIRTHDAY_NOTIFICATION = gql`
  mutation UpdateBirthdayNotification($userId: ID!, $notificationSent: Boolean!) {
    updateBirthdayNotification(userId: $userId, notificationSent: $notificationSent)
  }
`; 