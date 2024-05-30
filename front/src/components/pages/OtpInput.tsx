import React, { useMemo } from "react";

type Props = {
    value:string;
    valueLength: number;
    onChange: (value: string) => void;
}

export default function OtpInput({value, valueLength, onChange}: Props)
{
    const valueItems = useMemo(() => {
        const valueArray = value.split('');
        const items:Array<string> = [];

        for (let i = 0; i < valueLength; i++)
        {
            const c = valueArray[i];
            const re = new RegExp(/^\d+$/);

            if (re.test(c))
                items.push(c);
            else
                items.push('');
        }
        return items;
    }, [value, valueLength]);


    const focusToNextInput = (target: HTMLElement) => {
        const nextElement = target.nextElementSibling as HTMLInputElement | null;
    
        if (nextElement)
          nextElement.focus();
      };

    const focusToPrevInput = (target: HTMLElement) => {
        const previousElement = target.previousElementSibling as HTMLInputElement | null;
        
        if (previousElement)
            previousElement.focus();
    };

      const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const target = e.target;
        let targetValue = target.value.trim();
        const re = new RegExp(/^\d+$/);
        const isTargetValueDigit = re.test(targetValue);
    
        if (!isTargetValueDigit && targetValue !== '')
          return;
        const nextInput = target.nextElementSibling as HTMLInputElement | null;
        if (!isTargetValueDigit && nextInput && nextInput.value !== '')
          return;
        targetValue = isTargetValueDigit ? targetValue : ' ';
        const targetValueLength = targetValue.length;
        if (targetValueLength === 1)
        {
          const newValue = value.substring(0, idx) + targetValue + value.substring(idx + 1);
          onChange(newValue);
          if (!isTargetValueDigit)
            return;
          focusToNextInput(target);
        }
        else if (targetValueLength === valueLength)
        {
          onChange(targetValue);
          target.blur();
        }
      };

    const KeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const targetValue = target.value;

        target.setSelectionRange(0, targetValue.length);
        if (e.key !== 'Backspace' || targetValue !== '')
            return;
        focusToPrevInput(target);
    };

    const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        const { target } = e;
        const prevInput = target.previousElementSibling as HTMLInputElement | null;
        if (prevInput && prevInput.value === '')
            return prevInput.focus();
        target.setSelectionRange(0, target.value.length);
    };

    return (
        <div className="otp-group text-slate-950 flex flex-row gap-x-3 w-[100%] max-w-sm">
            {valueItems?.map((digit, index) => (
                <input 
                className="rounded-lg h-16 text-center w-[100%] outline-none focus:border-2 focus:border-orange-400"
                key={index}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{1}" 
                maxLength={valueLength}
                value={digit}
                onChange={(e) => inputOnChange(e, index)}
                onKeyDown={(e) => KeyDown(e)}
                onFocus={inputFocus}></input>
            ))}
        </div>
    );
}

new RegExp(/^\d+$/);