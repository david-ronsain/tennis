const convertPointsToScore = (points: number, otherPoints: number): string => {
    if (points === 0) return '0'
    else if (points === 1) return '15'
    else if (points === 2) return '30'
    else if ((points % 2 === 1 && points > 2) && (otherPoints % 2 === 0 && otherPoints > 2)) return ''
    else if ((points % 2 === 0 && points > 2) && (otherPoints % 2 === 1 && otherPoints > 2)) return 'AV'
    
    return '40'
}

const formatPlayerName = (team: any, prefix: string = ''): string => {
    if (typeof team === 'object') {
        return prefix.toString() + team.infos.firstName + ' ' + team.infos.lastName
    }
    return ''
}

export {
    convertPointsToScore,
    formatPlayerName,
}