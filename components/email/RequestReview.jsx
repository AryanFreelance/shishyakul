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

export const YelpRecentLoginEmail = ({
  name,
  email,
  ay,
  grade,
  userId,
  additionalMessage,
  feeData,
  loginDate,
}) => {
  const formattedDate = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(loginDate);

  // Content - User's Email, AY, Grade, Batch, Review, Fee Data []

  return (
    <Html>
      <Head />
      <Preview>Review Requested</Preview>
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
                  Namaste, Shishyakul
                </Heading>
                <Heading
                  as="h2"
                  style={{
                    fontSize: 26,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  A Shishya have requested for FEE REVIEW.
                </Heading>
                <Text style={paragraph}>
                  <b>Student Name: </b>
                  <br />
                  {name}
                </Text>
                <Text style={{ ...paragraph, marginTop: -5 }}>
                  <b>Student Email: </b>
                  <br />
                  {email}
                </Text>
                <Text style={{ ...paragraph, marginTop: -5 }}>
                  <b>Student Profile: </b>
                  <br />
                  {`https://shishyakul.in/dashboard/student/${ay}/${grade}/${userId}`}
                </Text>
                <Text style={{ ...paragraph, marginTop: -5 }}>
                  <b>Review: </b>
                  <br />
                  {additionalMessage}
                </Text>
                <Container>
                  <Text style={{ ...paragraph, marginTop: -5 }}>
                    Fee Details
                  </Text>
                  {/* Fee Data */}
                  <Container style={feeContainerStyle}>
                    {feeData &&
                      feeData.length > 0 &&
                      feeData.map((data) => (
                        <Container key={data?.createdAt} style={feeBoxStyle}>
                          <Text style={{ ...paragraph, marginTop: -5 }}>
                            <b>Fees Paid: </b> {data.feesPaid}
                          </Text>
                          <Text style={{ ...paragraph, marginTop: -5 }}>
                            <b>Paid On: </b> {data.paidOn}
                          </Text>
                          <Text style={{ ...paragraph, marginTop: -5 }}>
                            <b>Mode: </b> {data.mode}
                          </Text>
                          {data.remark && (
                            <Text style={{ ...paragraph, marginTop: -5 }}>
                              <b>Remark: </b> {data.remark}
                            </Text>
                          )}
                        </Container>
                      ))}
                  </Container>
                </Container>
              </Column>
            </Row>
            <Section style={bottomContainer}>
              <Button href={`mailto:${email}`} style={button}>
                Revert Back
              </Button>
            </Section>
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

export default YelpRecentLoginEmail;

const main = {
  backgroundColor: "#fff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const paragraph = {
  fontSize: 16,
};

const bottomContainer = {
  textAlign: "center",
};

const button = {
  backgroundColor: "#e00707",
  borderRadius: 3,
  color: "#FFF",
  fontWeight: "bold",
  border: "1px solid rgb(0,0,0, 0.1)",
  cursor: "pointer",
  padding: "12px 30px",
};

const feeContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "60px",
};

const feeBoxStyle = {
  border: "1px solid rgb(255, 255, 255, 0.7)",
  borderRadius: "3px",
  padding: "20px",
  // paddingLeft: 2,
  // paddingRight: 2,
  marginBottom: "20px",
  marginTop: "20px",
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
