import Login from './Login';
import Register from './Register';

const AuthPage = () => {
    return (
        <div className="container py-5">
            <div className="row justify-content-center g-4">
                <div className="col-md-6 col-lg-5">
                    <Login />
                </div>
                <div className="col-md-6 col-lg-5">
                    <Register />
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
