import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
  Link,
  Button,
} from "@react-email/components";
import * as React from "react";

export const BirthdayTemplate = ({ birthdayStudents, currentDate }) => {
  const formattedDate = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
  }).format(currentDate || new Date());

  return (
    <Html>
      <Head />
      <Preview>Birthday Notifications for {formattedDate}</Preview>
      <Body style={main}>
        <Container>
          <Section style={content}>
            <Row style={{ ...boxInfos, paddingBottom: "0" }}>
              <Column>
                <Heading
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Birthday Notifications
                </Heading>
                <Heading
                  as="h2"
                  style={{
                    fontSize: 26,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Students celebrating birthdays today!
                </Heading>

                <Text style={paragraph}>
                  <b>Date: </b>
                  {formattedDate}
                </Text>

                {birthdayStudents && birthdayStudents.length > 0 ? (
                  <>
                    <Text
                      style={{
                        ...paragraph,
                        marginTop: 20,
                        fontWeight: "bold",
                      }}
                    >
                      Today's Birthdays:
                    </Text>
                    {birthdayStudents.map((student, index) => (
                      <div key={index} style={studentCard}>
                        <Text
                          style={{
                            ...paragraph,
                            marginTop: 5,
                            fontWeight: "bold",
                          }}
                        >
                          {student.firstname} {student.lastname}
                        </Text>
                        <Text style={{ ...paragraph, marginTop: -5 }}>
                          <b>Academic Year:</b> {student.ay}
                        </Text>
                        <Text style={{ ...paragraph, marginTop: -5 }}>
                          <b>Grade:</b> {student.grade}
                        </Text>
                        <Text style={{ ...paragraph, marginTop: -5 }}>
                          <b>Email:</b> {student.email}
                        </Text>
                        {student.batch && (
                          <Text style={{ ...paragraph, marginTop: -5 }}>
                            <b>Batch:</b> {student.batch}
                          </Text>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <Text style={{ ...paragraph, marginTop: 20 }}>
                    No students are celebrating birthdays today.
                  </Text>
                )}
              </Column>
            </Row>
            <Row style={{ ...boxInfos, paddingTop: "0" }}>
              <Column style={containerButton} colSpan={2}>
                <Button
                  href="https://shishyakul.in/dashboard/birthdays"
                  style={button}
                >
                  View Birthday Dashboard
                </Button>
              </Column>
            </Row>
          </Section>

          <Section style={containerImageFooter}>
            <Img
              style={image}
              width={620}
              src="https://aryanshinde.in/email-footer.png"
            />
          </Section>

          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "rgb(0,0,0, 0.7)",
            }}
          >
            © {new Date().getFullYear()} | SHISHYAKUL |{" "}
            <Link href="https://shishyakul.in">www.shishyakul.in</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default BirthdayTemplate;

const main = {
  backgroundColor: "#fff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const paragraph = {
  fontSize: 16,
};

const studentCard = {
  border: "1px solid #e1e1e1",
  borderRadius: "5px",
  padding: "10px",
  marginBottom: "15px",
  backgroundColor: "#f9f9f9",
};

const containerButton = {
  display: "flex",
  justifyContent: "center",
  width: "100%",
};

const button = {
  backgroundColor: "#4b5563",
  borderRadius: 3,
  color: "#FFF",
  fontWeight: "bold",
  border: "1px solid rgb(0,0,0, 0.1)",
  cursor: "pointer",
  padding: "12px 30px",
};

const content = {
  border: "1px solid rgb(0,0,0, 0.1)",
  borderRadius: "3px",
  overflow: "hidden",
};

const image = {
  maxWidth: "100%",
};

const boxInfos = {
  padding: "20px",
};

const containerImageFooter = {
  padding: "45px 0 0 0",
};
