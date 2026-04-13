"use client";
import Image from "next/image";

interface IphoneMockupProps {
  image?: string;
  children?: React.ReactNode;
}

export const IphoneMockup = ({ image, children }: IphoneMockupProps) => {
  return (
    <div className="relative mx-auto h-[600px] w-[300px] md:h-[680px] md:w-[340px]">
      <div className="absolute inset-0 rounded-[50px] border-[14px] border-black bg-black shadow-xl">
        {/* Dynamic Island */}
        <div className="absolute left-1/2 top-[0.5rem] h-[1.8rem] w-[6rem] -translate-x-1/2 rounded-full bg-black z-10">
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-[0.6rem] h-[0.6rem] rounded-full bg-[#1a1a1a] ring-[1.5px] ring-[#2a2a2a]">
            <div className="absolute inset-[1.5px] rounded-full bg-[#0f0f0f]">
              <div className="absolute inset-[1.5px] rounded-full bg-[#151515] ring-[0.75px] ring-[#202020]" />
            </div>
          </div>
        </div>
        {/* Status bar */}
        <div className="absolute inset-0 top-[0.5rem] h-[1.8rem] flex items-center justify-between px-4 text-[0.65rem] text-black z-20">
          <span className="font-medium text-[0.9rem]">9:41</span>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="13" viewBox="0 0 20 13" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M19.2 1.72656C19.2 1.10524 18.7224 0.601562 18.1333 0.601562H17.0667C16.4776 0.601562 16 1.10524 16 1.72656V11.4766C16 12.0979 16.4776 12.6016 17.0667 12.6016H18.1333C18.7224 12.6016 19.2 12.0979 19.2 11.4766V1.72656ZM11.7659 3H12.8326C13.4217 3 13.8992 3.51577 13.8992 4.152V11.448C13.8992 12.0842 13.4217 12.6 12.8326 12.6H11.7659C11.1768 12.6 10.6992 12.0842 10.6992 11.448V4.152C10.6992 3.51577 11.1768 3 11.7659 3ZM7.43411 5.60156H6.36745C5.77834 5.60156 5.30078 6.1239 5.30078 6.76823V11.4349C5.30078 12.0792 5.77834 12.6016 6.36745 12.6016H7.43411C8.02322 12.6016 8.50078 12.0792 8.50078 11.4349V6.76823C8.50078 6.1239 8.02322 5.60156 7.43411 5.60156ZM2.13333 8H1.06667C0.477563 8 0 8.51487 0 9.15V11.45C0 12.0851 0.477563 12.6 1.06667 12.6H2.13333C2.72244 12.6 3.2 12.0851 3.2 11.45V9.15C3.2 8.51487 2.72244 8 2.13333 8Z" fill="black" />
            </svg>
          </div>
        </div>
        {/* Screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[35px] bg-white">
          <div className="inset-0 absolute top-[2.3rem]">
            {image && <Image src={image} alt="App screenshot" fill className="object-cover" priority />}
            {children}
          </div>
        </div>
      </div>
      <div className="absolute -right-[2px] top-[170px] h-12 w-[3px] rounded-l-lg bg-black" />
      <div className="absolute -left-[2px] top-[120px] h-12 w-[3px] rounded-r-lg bg-black" />
      <div className="absolute -left-[2px] top-[170px] h-14 w-[3px] rounded-r-lg bg-black" />
    </div>
  );
};
