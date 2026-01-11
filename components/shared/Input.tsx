import { ReactNode } from "react";

const Label = ({ children }: { children: ReactNode}) => {
  return (
    <label className="input-label typo-14-medium">{ children }</label>
  )
}

const InputContainer = () => {
  return (
    <div className="input-box">
      
    </div>
  )
}

export {
  Label,
  InputContainer
};