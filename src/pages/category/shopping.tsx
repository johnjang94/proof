import Image from "next/image";

export default function Shopping() {
  return (
    <div className="flex justify-center">
      <div className="my-10 text-center">
        <Image
          src="/logo+slogan_white.png"
          alt="logo"
          width={420}
          height={420}
          priority
        />
        <h1 className="text-xl">Coming soon</h1>
      </div>
    </div>
  );
}
