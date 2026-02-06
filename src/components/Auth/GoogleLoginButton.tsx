import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';

export const GoogleLoginButton: React.FC = () => {
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // ログイン成功後、ユーザーのUIDを使ったミュージアムURLへ遷移
            navigate(`/museum/${user.uid}`);
        } catch (error) {
            console.error("Google login error:", error);
            alert("ログインに失敗しました。");
        }
    };

    return (
        <button
            onClick={handleGoogleLogin}
            className="flex items-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-full font-medium tracking-wide hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
        >
            <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
            />
            Googleでログインして始める
        </button>
    );
};
