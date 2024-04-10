import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

const page = () => {
  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="pb-10">
        <div className="flex justify-between items-center">
          <h2 className="subheading">Test Papers</h2>
          <Button asChild>
            <Link
              href="/dashboard/tests/add"
              className="flex gap-2 items-center"
            >
              <span className="barlow-regular">Add Test</span> <Plus />
            </Link>
          </Button>
        </div>
        <div className="mt-8">
          <div className="flex flex-col gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="flex flex-col md:flex-row w-full md:justify-between md:items-center bg-secondary text-primary p-4 rounded"
              >
                <div className="md:w-[84%]">
                  <h3 className="smallheading">Test {item}</h3>
                  <span>Created on - 20-04-2024</span>
                </div>
                <div className="flex w-full md:w-[16%] justify-end mt-4 md:mt-0 items-center gap-4">
                  <Button variant="outline">View</Button>
                  <Link href="/dashboard/test/randomid">Manage</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default page;
