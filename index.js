const phonePatters = [
    /[\W][7,8][\d][\d][\d][\d][\d][\d][\d][\d][\d][\d][\W]/g, // 8KKKNNNNNNN
    /[\W][7,8][\s][\d][\d][\d][\s][\d][\d][\d][\s][\d][\d][\s][\d][\d][\W]/g, // 8 KKK NNN NN NN
    /[\W][7,8][\s][(][\d][\d][\d][)][\s][\d][\d][\d][\s][\d][\d][\s][\d][\d][\W]/g, // 8 (KKK) NNN NN NN
    /[\W][7,8][\s][(][\d][\d][\d][)][\s][\d][\d][\d][-][\d][\d][-][\d][\d][\W]/g, // 8 (KKK) NNN-NN-NN
    /[\W][7,8][\s][\d][\d][\d][\s][\d][\d][\d][-][\d][\d][-][\d][\d][\W]/g, // 8 KKK NNN-NN-NN
    /[\W][7,8][(][\d][\d][\d][)][\d][\d][\d][\d][\d][\d][\d][\W]/g, // 8(KKK)NNNNNNN
    /[\W][7,8][-][\d][\d][\d][-][\d][\d][\d][-][\d][\d][-][\d][\d][\W]/g, // 8-KKK-NNN-NN-NN
    /[\W][7,8][(][\d][\d][\d][)][\d][\d][\d][-][\d][\d][-][\d][\d][\W]/g // 8(KKK)NNN-NN-NN
]

const phonesWithoutCountryCodePatterns = [
    /[\W][\d][\d][\d][\d][\d][\d][\d][\d][\d][\d][\W]/g, // KKKNNNNNNN
    /[\W][\d][\d][\d][\s][\d][\d][\d][\s][\d][\d][\s][\d][\d][\W]/g, // KKK NNN NN NN
    /[\W][(][\d][\d][\d][)][\s][\d][\d][\d][\-][\d][\d][\-][\d][\d][\W]/g, // (KKK) NNN-NN-NN
    /[\W][(][\d][\d][\d][)][\s][\d][\d][\d][\s][\d][\d][\s][\d][\d][\W]/g, // (KKK) NNN NN NN
    /[\W][(][\d][\d][\d][)][\d][\d][\d][\d][\d][\d][\d][\W]/g, // (KKK)NNNNNNN
]

const phonesWithoutCodePatterns = [
    /[\W][\d][\d][\d][\s][\d][\d][\d][\d][\W]/g, // NNN NNNN
    /[\W][\d][\d][\d][\s][\d][\d][\s][\d][\d][\W]/g, // NNN NN NN
    /[\W][\d][\d][\d][-][\d][\d][-][\d][\d][\W]/g, // NNN-NN-NN
    /[\W][\d][\d][\d][\s][\d][\d][-][\d][\d][\W]/g, // NNN NN-NN
]

const findPhonesByUrl = async (url) => {
    const response = await fetch(url)
    const text = await response.text()

    let bodyStart = text.search(/[<][b][o][d][y]/)
    let bodyEnd = text.search(/[<][/][b][o][d][y][>]/)
    let body = text.slice(bodyStart, bodyEnd)
    
    let phones = []
    
    phonePatters.map(regex => {
        let matches = [...body.matchAll(regex)]
        matches.map(it => {
            let phone = it[0].replace(/\D/g, "")
            phone = "8" + phone.substring(1)

            phones.push(phone)
        })
    })
    
    let phonesText = "$" + phones.join("$") + "$"
    
    
    phonesWithoutCountryCodePatterns.map(regex => {
        let matches = [...body.matchAll(regex)]
        matches.map(it => {
            let phone = it[0].replace(/\D/g, "")

            if (!phonesText.includes(phone)) {
                phones.push(`8${phone}`)
            }
        })
    })
    
    phonesText = "$" + phones.join("$") + "$"

    phonesWithoutCodePatterns.map(regex => {
        let matches = [...body.matchAll(regex)]
        matches.map(it => {
            let phone = it[0].replace(/\D/g, "")

            if (!phonesText.includes(phone)) {
                phones.push(`8495${phone}`)
            }
        })
    })
    return [...new Set(phones)]
}

module.exports = async function findPhones(urls) {

    let htmls = urls.map(url => {
        return findPhonesByUrl(url)
    })

    let result = []

    for (let i = 0; i < htmls.length; i++) {
        result = result.concat(await htmls[i])
    }

    return result
}