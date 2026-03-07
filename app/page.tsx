  import HomePage from "@/components/Hero";
  import HomeNav from "@/components/HomeNav";

  export default function Home() {
    return (
      <div className="min-h-screen  text-textNa">
        <HomeNav></HomeNav>
        <HomePage></HomePage>
      </div>
    );
  }
