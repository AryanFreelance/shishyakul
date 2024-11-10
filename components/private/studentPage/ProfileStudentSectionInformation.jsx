import { Label } from "@/components/ui/label";
import React from "react";

const ProfileStudentSectionInformation = ({
  studentSectionInformation,
  setStudentSectionInformation,
}) => {
  return (
    <div className="m-2 p-2">
      <h3 className="subsubheading text-secondary">
        Student's Basic Information
      </h3>
      <div className="mt-6">
        <form className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="flex flex-col w-full">
              <Label
                htmlFor="describe-yourself"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Describe Yourself
              </Label>
              <textarea
                type="text"
                id="describe-yourself"
                className="input-taking w-full resize-none"
                placeholder="..."
                rows={4}
                value={studentSectionInformation.describeYourself}
                onChange={(e) =>
                  setStudentSectionInformation({
                    ...studentSectionInformation,
                    describeYourself: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="flex flex-col w-full">
              <Label
                htmlFor="passion"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Passion
              </Label>
              <input
                type="text"
                id="passion"
                className="input-taking w-full resize-none"
                placeholder="..."
                value={studentSectionInformation.passion}
                onChange={(e) =>
                  setStudentSectionInformation({
                    ...studentSectionInformation,
                    passion: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col w-full">
              <Label
                htmlFor="skills"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Skills
              </Label>
              <input
                type="text"
                id="skills"
                className="input-taking w-full disabled:bg-black/10"
                placeholder="..."
                value={studentSectionInformation.skills}
                onChange={(e) =>
                  setStudentSectionInformation({
                    ...studentSectionInformation,
                    skills: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="flex flex-col w-full">
              <Label
                htmlFor="hobbies"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Hobbies
              </Label>
              <input
                type="text"
                id="hobbies"
                className="input-taking w-full resize-none"
                placeholder="..."
                value={studentSectionInformation.hobbies}
                onChange={(e) =>
                  setStudentSectionInformation({
                    ...studentSectionInformation,
                    hobbies: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col w-full">
              <Label
                htmlFor="dreams"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Dreams
              </Label>
              <input
                type="text"
                id="dreams"
                className="input-taking w-full disabled:bg-black/10"
                placeholder="..."
                value={studentSectionInformation.dreams}
                onChange={(e) =>
                  setStudentSectionInformation({
                    ...studentSectionInformation,
                    dreams: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="flex flex-col w-full">
              <Label
                htmlFor="achievements"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Achievements
              </Label>
              <textarea
                type="text"
                id="achievements"
                className="input-taking w-full resize-none"
                placeholder="..."
                rows={4}
                value={studentSectionInformation.achievements}
                onChange={(e) =>
                  setStudentSectionInformation({
                    ...studentSectionInformation,
                    achievements: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="flex flex-col w-full">
              <Label
                htmlFor="strength"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Strength
              </Label>
              <input
                type="text"
                id="strength"
                className="input-taking w-full resize-none"
                placeholder="..."
                value={studentSectionInformation.strength}
                onChange={(e) =>
                  setStudentSectionInformation({
                    ...studentSectionInformation,
                    strength: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col w-full">
              <Label
                htmlFor="weakness"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Weakness
              </Label>
              <input
                type="text"
                id="weakness"
                className="input-taking w-full disabled:bg-black/10"
                placeholder="..."
                value={studentSectionInformation.weakness}
                onChange={(e) =>
                  setStudentSectionInformation({
                    ...studentSectionInformation,
                    weakness: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="flex flex-col w-full">
              <Label
                htmlFor="thingsWantToImprove"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Things that you want to improve
              </Label>
              <textarea
                type="text"
                id="thingsWantToImprove"
                className="input-taking w-full resize-none"
                placeholder="..."
                rows={4}
                value={studentSectionInformation.thingsWantToImprove}
                onChange={(e) =>
                  setStudentSectionInformation({
                    ...studentSectionInformation,
                    thingsWantToImprove: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="flex flex-col w-full">
              <Label
                htmlFor="anythingToShare"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Anything you would like to Share/Add
              </Label>
              <textarea
                type="text"
                id="anythingToShare"
                className="input-taking w-full resize-none"
                placeholder="..."
                rows={4}
                value={studentSectionInformation.anythingToShare}
                onChange={(e) =>
                  setStudentSectionInformation({
                    ...studentSectionInformation,
                    anythingToShare: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="flex flex-col w-full">
              <Label
                htmlFor="expectationsWithShishyakul"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Expectations from SHISHYAKUL
              </Label>
              <textarea
                type="text"
                id="expectationsWithShishyakul"
                className="input-taking w-full resize-none"
                placeholder="..."
                rows={4}
                value={studentSectionInformation.expectationsWithShishyakul}
                onChange={(e) =>
                  setStudentSectionInformation({
                    ...studentSectionInformation,
                    expectationsWithShishyakul: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileStudentSectionInformation;
