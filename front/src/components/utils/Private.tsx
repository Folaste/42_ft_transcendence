import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom'
import { selectStatus } from '../../stores/selector';

function Private() {
    const status = useSelector(selectStatus);
    return(
        status ? <Outlet/> :  <Navigate to={'/'} replace />
    );
}

export default Private;