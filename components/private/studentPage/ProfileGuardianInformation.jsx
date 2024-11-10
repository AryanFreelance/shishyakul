import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react'

const ProfileGuardianInformation = ({guardianInformation, setGuardianInformation}) => {
  return (
    <div className="m-2 p-2">
              <h3 className="subsubheading text-secondary">
                Guardian Information
              </h3>
              <div className="mt-6">
                <form className="flex flex-col gap-6">
                  {/* Mother's Details */}
                  <div className="flex flex-col lg:flex-row gap-4 w-full">
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="mother-first-name"
                        className="text-xl text-secondary barlow-medium mb-2"
                      >
                        Mother's First Name
                      </Label>
                      <input
                        type="text"
                        id="mother-first-name"
                        className="input-taking w-full"
                        placeholder="Update Mother's First Name..."
                        value={guardianInformation.motherFirstName}
                        onChange={(e) => {
                          setGuardianInformation({
                            ...guardianInformation,
                            motherFirstName: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="mother-middle-name"
                        className="text-xl text-secondary barlow-medium mb-2"
                      >
                        Mother's Middle Name
                      </Label>
                      <input
                        type="text"
                        id="mother-middle-name"
                        className="input-taking w-full"
                        placeholder="Update Mother's Middle Name..."
                        value={guardianInformation.motherMiddleName}
                        onChange={(e) => {
                          setGuardianInformation({
                            ...guardianInformation,
                            motherMiddleName: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="mother-last-name"
                        className="text-xl text-secondary barlow-medium mb-2"
                      >
                        Mother's Last Name
                      </Label>
                      <input
                        type="text"
                        id="mother-last-name"
                        className="input-taking w-full"
                        placeholder="Update Mother's Last Name..."
                        value={guardianInformation.motherLastName}
                        onChange={(e) => {
                          setGuardianInformation({
                            ...guardianInformation,
                            motherLastName: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-4 w-full">
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="mother-occupation"
                        className="text-xl text-secondary barlow-medium mb-2"
                      >
                        Mother's Occupation
                      </Label>
                      <input
                        type="text"
                        id="mother-occupation"
                        className="input-taking w-full"
                        placeholder="Update Mother's Occupation..."
                        value={guardianInformation.motherOccupation}
                        onChange={(e) => {
                          setGuardianInformation({
                            ...guardianInformation,
                            motherOccupation: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="mother-designation"
                        className="text-xl text-secondary barlow-medium mb-2"
                      >
                        Mother's Designation
                      </Label>
                      <input
                        type="text"
                        id="mother-designation"
                        className="input-taking w-full"
                        placeholder="Update Mother's Designation..."
                        value={guardianInformation.motherDesignation}
                        onChange={(e) => {
                          setGuardianInformation({
                            ...guardianInformation,
                            motherDesignation: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-4 w-full">
                    <div className="flex flex-col w-full">
                      <Label className="text-xl text-secondary barlow-medium mb-2">
                        Ex-Service Women
                      </Label>
                      <Select
                        onChange={(value) => {
                          setGuardianInformation({
                            ...guardianInformation,
                            motherExServiceWomen:
                              value === "Yes" ? true : false,
                          });
                        }}
                      >
                        <SelectTrigger className="input-taking w-full py-6 border-2 border-secondary">
                          <SelectValue
                            placeholder={
                              guardianInformation.motherExServiceWomen
                                ? "YES"
                                : "NO"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="mother-contact-number"
                        className="text-xl text-secondary barlow-medium mb-2"
                      >
                        Mother's Contact Number
                      </Label>
                      <input
                        type="tel"
                        id="mother-contact-number"
                        className="input-taking w-full"
                        placeholder="Update Mother's Contact Number..."
                        value={guardianInformation.motherContactNumber}
                        onChange={(e) => {
                          setGuardianInformation({
                            ...guardianInformation,
                            motherContactNumber: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                  {/* Father's Details */}
                  <div className="flex flex-col lg:flex-row gap-4 w-full">
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="father-first-name"
                        className="text-xl text-secondary barlow-medium mb-2"
                      >
                        Father's First Name
                      </Label>
                      <input
                        type="text"
                        id="father-first-name"
                        className="input-taking w-full"
                        placeholder="Update Father's First Name..."
                        value={guardianInformation.fatherFirstName}
                        onChange={(e) => {
                          setGuardianInformation({
                            ...guardianInformation,
                            fatherFirstName: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="father-middle-name"
                        className="text-xl text-secondary barlow-medium mb-2"
                      >
                        Father's Middle Name
                      </Label>
                      <input
                        type="text"
                        id="father-middle-name"
                        className="input-taking w-full"
                        placeholder="Update Father's Middle Name..."
                        value={guardianInformation.fatherMiddleName}
                        onChange={(e) => {
                          setGuardianInformation({
                            ...guardianInformation,
                            fatherMiddleName: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="father-last-name"
                        className="text-xl text-secondary barlow-medium mb-2"
                      >
                        Father's Last Name
                      </Label>
                      <input
                        type="text"
                        id="father-last-name"
                        className="input-taking w-full"
                        placeholder="Update Father's Last Name..."
                        value={guardianInformation.fatherLastName}
                        onChange={(e) => {
                          setGuardianInformation({
                            ...guardianInformation,
                            fatherLastName: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-4 w-full">
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="father-occupation"
                        className="text-xl text-secondary barlow-medium mb-2"
                      >
                        Father's Occupation
                      </Label>
                      <input
                        type="text"
                        id="father-occupation"
                        className="input-taking w-full"
                        placeholder="Update Father's Occupation..."
                        value={guardianInformation.fatherOccupation}
                        onChange={(e) => {
                          setGuardianInformation({
                            ...guardianInformation,
                            fatherOccupation: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="father-designation"
                        className="text-xl text-secondary barlow-medium mb-2"
                      >
                        Father's Designation
                      </Label>
                      <input
                        type="text"
                        id="father-designation"
                        className="input-taking w-full"
                        placeholder="Update Father's Designation..."
                        value={guardianInformation.fatherDesignation}
                        onChange={(e) => {
                          setGuardianInformation({
                            ...guardianInformation,
                            fatherDesignation: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-4 w-full">
                    <div className="flex flex-col w-full">
                      <Label className="text-xl text-secondary barlow-medium mb-2">
                        Ex-Service Man
                      </Label>
                      <Select
                        onValueChange={(value) => {
                          setGuardianInformation({
                            ...guardianInformation,
                            fatherExServiceMen: value === "Yes" ? true : false,
                          });
                        }}
                      >
                        <SelectTrigger className="input-taking w-full py-6 border-2 border-secondary">
                          <SelectValue
                            placeholder={
                              guardianInformation.fatherExServiceMen
                                ? "YES"
                                : "NO"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="father-contact-number"
                        className="text-xl text-secondary barlow-medium mb-2"
                      >
                        Father's Contact Number
                      </Label>
                      <input
                        type="tel"
                        id="father-contact-number"
                        className="input-taking w-full"
                        placeholder="Update Father's Contact Number..."
                        value={guardianInformation.fatherContactNumber}
                        onChange={(e) => {
                          setGuardianInformation({
                            ...guardianInformation,
                            fatherContactNumber: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
  )
}

export default ProfileGuardianInformation