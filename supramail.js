const axios = require('axios')
const https = require('https')
const xml2js = require('xml2js')


const cookie = '' // cookie retirado do header de requisição quando feito login no painel admin do supramail.
const httpsAgent = new https.Agent({ rejectUnauthorized: false, keepAlive: true })
const opt = {
    headers: {
        Cookie: cookie,
        'Content-Type': 'text/plain; charset=UTF-8'
    },
    httpsAgent,
    withCredentials: true
}

const maxAttempts = 5

module.exports = {
    login: async () => {
        const connectionString = '' //string de conexão, foi retirada do payload que é enviado ao logar no painel admin do supramail.
        const urlLogin = 'https://painel.supramail.com.br/_REST/login/login'
        for (let count = 0; count < maxAttempts; count++) {
            try {
                const response = await axios.post(urlLogin, connectionString, opt)
                count = maxAttempts
                return response.data
            } catch (error) {
                console.log('Erro ao logar no supramail')
            }
        }
    },

    consultaGrupo: async () => {
        const urlGroupCheckup = 'https://painel.supramail.com.br/_REST/users/getDomainGroups?domain=autorizadoademicon.com.br'
        for (let count = 0; count < maxAttempts; count++) {
            try {
                const response = await axios.get(urlGroupCheckup, opt)
                let parseado
                xml2js.parseString(response.data, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    parseado = result
                });
                if (parseado['Error']) {
                    throw 'Erro';
                }
                count = maxAttempts
                let grupo = parseado['root']['$']['groups'].replace(":Padrão", "");
                return grupo

            } catch (error) {
                console.log(error);
            }
        }
    },
    criarConta: async (domainName, grupo, username, password, primeiroNome, sobrenome) => {
        const createAccountURL = 'https://painel.supramail.com.br/_REST/users/createAccount'
        const createUserPayload = `user=${domainName}&domain=${domainName}&level=email&userLevel=domain&group=${grupo}&name=${username}@${domainName}&pass=${password}&confirmPass=${password}&passwdExpire=0&firstName=${primeiroNome}&kind=INDIVIDUAL&lastName=${sobrenome}&customQuota=false&gmail=false`
        for (let count = 0; count < maxAttempts; count++) {
            try {
                const response = await axios.post(createAccountURL, createUserPayload, opt)
                let parseado
                xml2js.parseString(response.data, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    parseado = result
                });
                if (parseado['Error']) {
                    if (parseado['Error']['$']['code'] == '9537') return false
                    throw 'Erro';
                }
                count = maxAttempts
                return true
            } catch (error) {
                console.log(error)
            }
        }
    }
};