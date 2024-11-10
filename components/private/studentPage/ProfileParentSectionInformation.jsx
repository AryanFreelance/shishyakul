import { Label } from "@/components/ui/label";
import React from "react";

const ProfileParentSectionInformation = ({
  parentSectionInformation,
  setParentSectionInformation,
}) => {
  return (
    <div className="m-2 p-2">
      <h3 className="subsubheading text-secondary">Parents Section</h3>
      <div className="mt-6">
        <form className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="flex flex-col w-full">
              <Label
                htmlFor="expectations"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                What are your expectations from SHISHYAKUL?
              </Label>
              <textarea
                type="text"
                id="expectations"
                className="input-taking w-full resize-none"
                placeholder="..."
                rows={4}
                value={parentSectionInformation.expectationsWithShishyakul}
                onChange={(e) =>
                  setParentSectionInformation({
                    ...parentSectionInformation,
                    expectationsWithShishyakul: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="flex flex-col w-full">
              <Label
                htmlFor="strengthAndWeakness"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Is there anything you would like to tell us about your child?
                (strength & weakness)
              </Label>
              <textarea
                type="text"
                id="strengthAndWeakness"
                className="input-taking w-full resize-none"
                placeholder="..."
                rows={4}
                value={parentSectionInformation.strengthAndWeakness}
                onChange={(e) =>
                  setParentSectionInformation({
                    ...parentSectionInformation,
                    strengthAndWeakness: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="flex flex-col w-full">
              <Label
                htmlFor="medicalAllergiesAndConcerns"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Medical Report Allergies/Medical conditions or any other
                concerns of your child?
              </Label>
              <textarea
                type="text"
                id="medicalAllergiesAndConcerns"
                className="input-taking w-full resize-none"
                placeholder="..."
                rows={4}
                value={parentSectionInformation.medicalAllergiesAndConcerns}
                onChange={(e) =>
                  setParentSectionInformation({
                    ...parentSectionInformation,
                    medicalAllergiesAndConcerns: e.target.value,
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

export default ProfileParentSectionInformation;
