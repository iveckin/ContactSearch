import ApiConnection from '@eway-crm/connector';

const serviceUrl = 'https://free.eway-crm.com/31994';
const username = 'api';
const passwordHash = '470AE7216203E23E1983EF1851E72947';

const connection = ApiConnection.create(
    serviceUrl,
    username,
    passwordHash,
    'ReactAppSample1',
    '00:00:00:00:00',
    'SampleTestMachine',
    (err) => {
        console.error(err);
        alert('There has been an error with eWay Connector. See the console for more.');
    }
);

export default connection;