<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useTournamentStore as store } from '../stores/tournamentStore'
import type { ICalendar, IMatch } from 'core/interfaces'
import { MatchRound, MatchType, PlayerCategory } from 'core/enums'
import { watch } from 'vue'
import { ref } from 'vue'
import { computed } from 'vue'
import uniq from 'lodash.uniq'
import sortBy from 'lodash.sortby'
import { formatPlayerName } from 'front-common'
import { MatchResponse } from 'core/responses'
import { io } from 'socket.io-client'
import { reactive } from 'vue'
import MatchScore from 'front-match-score/App'

const route = useRoute()
if (route?.params?.id?.toString()) {
    store().loadTournament(route?.params?.id?.toString())
}
watch(
    () => route,
    () => {
        if (route?.params?.id?.toString()) {
            store().loadTournament(route?.params?.id?.toString())
        }
    },
    { deep: true }
)

const getRounds = (matches: IMatch[]): MatchRound[] => {
    const sortedRounds: MatchRound[] = []

    if (matches) {
        const rounds: MatchRound[] = uniq(matches.map((m: IMatch) => m.round))
        rounds.forEach((round: MatchRound) => {
            sortedRounds[Object.values(MatchRound).findIndex((r: MatchRound) => r === round)] =
                round
        })
    }

    return sortedRounds
}

const getBracket = (
    calendar: ICalendar,
    matchType: MatchType = MatchType.SINGLES,
    category: PlayerCategory = PlayerCategory.ATP
) => {
    const bracket: any[] = []
    if (calendar?.draw?.[matchType]?.[category]) {
        const sortedRounds = getRounds(calendar.draw[matchType][category] as IMatch[])

        const matches: IMatch[] = sortBy(calendar.draw[matchType][category] ?? [], [
            'number'
        ]) as IMatch[]
        sortedRounds
            .filter((val) => val)
            .forEach((round: MatchRound) => {
                const filteredMatches: IMatch[] = matches.filter((m: IMatch) => m.round === round)
                bracket.push({
                    games: filteredMatches.map((m: IMatch) => ({
                        player1: {
                            id: m.number + '-' + m.team1.number,
                            name:
                                formatPlayerName(m.team1.player1) +
                                formatPlayerName(m.team1.player2, ' - '),
                            winner: !!m.team1.isWinner,
                            number: m.team1.number
                        },
                        player2: {
                            id: m.number + '-' + m.team2.number,
                            name:
                                formatPlayerName(m.team2.player1) +
                                formatPlayerName(m.team2.player2, ' - '),
                            winner: !!m.team2.isWinner,
                            number: m.team2.number
                        },
                        round,
                        score: m.score,
                        matchId: m._id,
                        state: m.state
                    }))
                })
            })
    }

    return bracket
}

const loadCalendar = (index: any) => {
    if (!store().getCalendar?.[index]?.draw) {
        store().loadDraw(store().getCalendar[index]._id.toString(), index)
    }
}
const calendarSelected = ref()
const calendar = computed(() => store().getCalendar)

watch(calendarSelected, (newval) => loadCalendar(newval))

const socket = io(import.meta.env.VITE_WEBSOCKET_API_URL + 'matches')
socket.on('connect', () => {
    socket.on('new_score', (match: MatchResponse) => {
        store().refreshMatch(match)
    })
})

const filters = reactive<{ type: MatchType; category: PlayerCategory }[]>(
    [] as { type: MatchType; category: PlayerCategory }[]
)
const matchTypeFilter: MatchType[][] = []
const playerCategoryFilter: PlayerCategory[][] = []
watch(
    () => calendar.value,
    (newCal: ICalendar[]) => {
        newCal.forEach((cal: ICalendar, index: number) => {
            if (cal.draw) {
                matchTypeFilter.push(Object.keys(cal.draw) as MatchType[])
                playerCategoryFilter.push(
                    Object.keys(cal.draw[matchTypeFilter[index][0]]) as PlayerCategory[]
                )
                filters.push({
                    type: matchTypeFilter[index][0],
                    category: playerCategoryFilter[index][0]
                })
            }
        })
    },
    { deep: true }
)
</script>

<template>
    <v-card>
        <v-card-title>
            {{ store().getName }}
        </v-card-title>

        <v-card-subtitle> {{ store().getCategory }} - {{ store().getCountry }} </v-card-subtitle>

        <v-card-text>
            <v-expansion-panels v-model="calendarSelected">
                <v-expansion-panel v-for="(cal, index) in calendar" :key="`calendar${cal._id}`">
                    <v-expansion-panel-title>
                        {{ cal.startDate.substring(0, 4) }}
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <div>
                            From {{ cal.startDate.substring(0, 10) }} to
                            {{ cal.endDate.substring(0, 10) }}
                        </div>

                        <div v-if="filters.length > index">
                            <v-btn-toggle v-model="filters[index].type" variant="outlined" divided>
                                <v-btn
                                    v-for="type in matchTypeFilter[index]"
                                    :key="type"
                                    :value="type"
                                >
                                    {{ type }}
                                </v-btn>
                            </v-btn-toggle>
                            <v-btn-toggle
                                v-model="filters[index].category"
                                variant="outlined"
                                divided
                            >
                                <v-btn
                                    v-for="category in playerCategoryFilter[index]"
                                    :key="category"
                                    :value="category"
                                >
                                    {{ category }}
                                </v-btn>
                            </v-btn-toggle>
                        </div>

                        <section class="draw mx-n2" v-if="cal.draw">
                            <div
                                :class="
                                    'rounds' +
                                    Object.keys(
                                        getBracket(
                                            cal,
                                            filters[index].type,
                                            filters[index].category
                                        )
                                    ).length
                                "
                                v-for="(round, i) in getBracket(
                                    cal,
                                    filters[index].type,
                                    filters[index].category
                                )"
                                :key="`calendar${cal._id.toString()}${i}`"
                            >
                                <div
                                    class="match pa-2"
                                    v-for="match in round.games"
                                    :key="`calendar${cal._id.toString()}${i}${match.number}`"
                                    :class="`match match${match.matchId}`"
                                >
                                    <match-score
                                        :team1-name="match.player1.name"
                                        :team1-number="match.player1.number"
                                        :team2-name="match.player2.name"
                                        :team2-number="match.player2.number"
                                        :id="match.matchId.toString()"
                                        :score="match.score"
                                        :state="match.state"
                                    />
                                </div>
                            </div>
                        </section>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card-text>
    </v-card>
</template>

<style lang="scss">
.draw {
    width: 100%;
    display: flex;

    > div {
        &.rounds7 {
            width: 350px;
            min-width: 350px;
            display: flex;
            flex-direction: column;
            align-items: start;
            justify-content: space-around;
        }

        .match {
            width: 100%;
        }
    }
}
</style>
