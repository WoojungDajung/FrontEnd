import Link from "next/link";

const Footer = () => {
  return (
    <footer>
      <p className="text-center typo-12-regular text-gray-400">
        문제가 발생했나요?
        <br />
        <Link href={"/"} className="underline">
          오류 신고 및 문의는 여기를 눌러주세요.
        </Link>
      </p>
    </footer>
  );
};

export default Footer;
