import Link from "next/link";

const Footer = () => {
  return (
    <div className="text-gray-400">
      <p className="text-center typo-14-regular">
        문제가 발생했나요?
        <br />
        오류 신고 및 문의: <Link href={"/"}>구글폼</Link>
      </p>
    </div>
  );
};

export default Footer;
