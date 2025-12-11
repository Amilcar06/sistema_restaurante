
import React from "react";
import { Input } from "./input";
import { Label } from "./label";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export function FormInput({ label, className, ...props }: FormInputProps) {
    return (
        <div className={className}>
            <Label className="text-[#1B1B1B] font-medium mb-1.5 block" htmlFor={props.id}>
                {label}
            </Label>
            <Input
                className="bg-white border-[#F26522]/20 text-[#1B1B1B] focus:border-[#F26522] focus:ring-[#F26522]/20"
                {...props}
            />
        </div>
    );
}
