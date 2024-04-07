import mentorsImg from "@/assets/banners/mentors.jpg";
import Image from "next/image";

const teachers = [
  {
    profileImg: mentorsImg,
    name: "Demo Mentor 1",
    subject: "Maths",
  },
  {
    profileImg: mentorsImg,
    name: "Demo Mentor 2",
    subject: "Physics",
  },
  {
    profileImg: mentorsImg,
    name: "Demo Mentor",
    subject: "Science",
  },
];

const OurTeachers = () => {
  return (
    <div id="teachers-wrapper" className="px-[1.4rem] md:px-[4rem] pb-[1rem]">
      <h2 className="subheading mb-8">Our Teachers</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
        {teachers.map((teacher, index) => (
          <div
            key={index}
            className="border-2 border-secondary p-6 md:p-8 text-center rounded-2xl hover:border-main transition-all duration-300 ease-in-out"
          >
            <Image
              src={teacher.profileImg}
              alt={teacher.name}
              className="rounded-lg mb-4"
              width={1000}
              height={1000}
            />
            <h3 className="text-[20px] barlow-semibold">{teacher.name}</h3>
            <p className="text-[18px] barlow-regular">{teacher.subject}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurTeachers;
