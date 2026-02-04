import Batches from "@/components/Batches";
import HomePage from "@/components/HomePage";
import HowItWorks from "@/components/HowItWorks";
import { ShareChallenge } from "@/components/ShareChallenge";
import SuccessStories from "@/components/successStories";

export default function Home() {
  return (
    <>
      <HomePage />
      <HowItWorks />
      <Batches />
      <ShareChallenge />
      <SuccessStories />
    </>
  );
}
