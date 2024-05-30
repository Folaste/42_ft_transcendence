import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../stores/store";
import { resetProfile, updateStatus } from "../../stores/Profile";
import { selectDatas, selectStatus, selectToken } from "../../stores/selector";
import api from "../../api/axios";
import lock from '../../images/lock.png'
import OtpInput from "./OtpInput";
import { SocketContext } from "../../context/SocketContext";

function TwoFactor() {

    const navigate = useNavigate();
const dispatch = useDispatch<AppDispatch>();
const [sendSms, setSendSms] = useState(false);
const data = useSelector(selectDatas);
useSelector(selectToken);
    const [otp, setOtp] = useState('');
const onChange = (value: string) => setOtp(value);
const [error, setError] = useState(false);
const status = useSelector(selectStatus);
const socket = useContext(SocketContext);

useEffect(() => {
    if (data.auth2F === false && status === false)
    {
        dispatch(resetProfile());
        navigate("/");
    }
}
)

async function sendEmail()
{
     await api.post(`/auth/sendTwoFaCode`
      ).then(() =>
        {
            setSendSms(true);
        }).catch(err => {
            if (err.response.data.statusCode === 401)
            {
                dispatch(resetProfile());
                socket.emit('unsetUserId');
                navigate('/');
            }
            else
                setError(true);
        })
}

function goToHGome()
{
    dispatch(resetProfile());
    navigate("/");
}

async function verifyCode(e:any)
{
    e.preventDefault();
    const newStatus = true;
    const numberValue = parseInt(otp);
    const data = {
        code: numberValue,
    };
    await api.post("auth/verifycode", data).then(() => {
        dispatch(updateStatus(newStatus));
        navigate('/Hub');
    }).catch(err => {
        if (err.response.data.statusCode === 401)
            {
                dispatch(resetProfile());
                socket.emit('unsetUserId');
                navigate('/');
            }
        else
            setError(true);
    })
}

    return (
        <div className="h-screen bg-slate-900 flex flex-col  text-center overflow-y-auto">
            <div className="h-screen m-32 md:m-0 flex flex-col text-lg lg:text-xl font-bold justify-center items-center text-center p-2 lg:p-8 ">
                <img src={lock} alt="Lock" className="mb-2 lg:mb-10"></img>
                <p className="text-xl lg:text-2xl"> Two Factor Authentification</p>
                {!sendSms ? 
                    (
                        <div className="gap-4">
                            <p className="text-base hidden lg:block lg:text-lg font-normal">You enabled two factor authentification</p>
                            <p className="text-base lg:text-lg font-normal">To continue you need to verify a code that will be send to your email</p>
                            {!error ? null :
                                        <p className="text-sm text-red-600">Sending email failed, please try again</p>
                            }
                            <button className="bg-gradient-to-r from-orange-400 to-orange-300 p-2 lg:p-5 rounded-full text-stone-950 mt-2 lg:mt-10 text-lg" onClick={() => sendEmail()}>Send a code now</button>
                        </div>
                    )
                    : 
                    (
                        <div>
                            <p className="mb-5 font-normal"> A verification code has been send to your email.</p>
                            <form onSubmit={verifyCode} >
                                <div className="flex flex-col gap-2 items-center justify-center">
                                    <OtpInput value={otp} valueLength={6} onChange={onChange}></OtpInput>
                                    {!error ? null :
                                        <p className="text-sm text-red-600">Invalid code, try again</p>
                                    }
                                    <button className="text-lg bg-gradient-to-r from-orange-400 to-orange-300 p-2 lg:p-5 rounded-full text-stone-950 mt-2 xl:mt-4 " type="submit">Verify my code</button>
                                </div>
                            </form>
                        </div>
                    )
                }
                <button className="text-lg bg-purple-500 p-2 lg:p-5 rounded-full text-stone-950 mt-2 lg:mt-5 mb-2" onClick={() => goToHGome()}>Return to home</button>
                {!sendSms ? null :
                    <button onClick={() => sendEmail()} className="text-sm mt-2 font-normal">Send a new verification code</button>
                }
            </div>
        </div>
    );
}

export {TwoFactor};