<script setup lang="ts">
import { MatchState } from 'core/enums'
import { convertPointsToScore } from 'front-common'
import { computed } from 'vue'

const props = defineProps<{
    team1Name: String
    team1Number: Number
    team2Name: String
    team2Number: Number
    id: String
    score: {
        sets: [number, number][]
        games: [number, number][]
        points: [number, number][]
        history: [number, number][]
    } | null
    state: MatchState | undefined
}>()

const showSets = computed(
    () =>
        !!props.state &&
        [
            MatchState.RETIRED,
            MatchState.SUSPENDED,
            MatchState.IN_PROGRESS,
            MatchState.FINISHED
        ].includes(props.state)
)
const showGamesAndPoints = computed(() => props.state === MatchState.IN_PROGRESS)
</script>

<template>
    <v-table density="compact">
        <tbody>
            <tr>
                <th v-text="team1Name" />
                <td
                    v-show="showSets"
                    v-for="(hist, index) in score?.history ?? []"
                    :key="id + '-' + index"
                >
                    {{ hist[0] }}
                </td>
                <td v-show="showGamesAndPoints">
                    {{ (score?.games ?? []).filter((g) => g[1] === team1Number).length }}
                </td>
                <td v-show="showGamesAndPoints">
                    {{
                        convertPointsToScore(
                            (score?.points ?? []).filter((p) => p[1] === team1Number).length,
                            (score?.points ?? []).filter((p) => p[1] === team2Number).length
                        )
                    }}
                </td>
            </tr>
            <tr>
                <th v-text="team2Name" />
                <td
                    v-show="showSets"
                    v-for="(hist, index) in score?.history ?? []"
                    :key="id + '-' + index"
                >
                    {{ hist[1] }}
                </td>
                <td v-show="showGamesAndPoints">
                    {{ (score?.games ?? []).filter((g) => g[1] === team2Number).length }}
                </td>
                <td v-show="showGamesAndPoints">
                    {{
                        convertPointsToScore(
                            (score?.points ?? []).filter((p) => p[1] === team2Number).length,
                            (score?.points ?? []).filter((p) => p[1] === team2Number).length
                        )
                    }}
                </td>
            </tr>
        </tbody>
    </v-table>
</template>

<style scoped lang="scss">
.v-table {
    --table-line-height: 0.2;
    --v-table-row-height: 24px;
    --v-table-header-height: 24px;
    --v-table-row-font-size: 12px;

    border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 4px;
    background-color: #f5f5f5;
    line-height: var(--v-table-line-height);

    &.v-table--density-compact tr {
        height: var(--v-table-row-height);
    }

    tr {
        font-size: var(--v-table-row-font-size);

        th,
        td:not(:last-of-type) {
            border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
        }

        td {
            text-align: center;

            &:last-of-type {
                background-color: #ccc;
            }
        }
    }
}
</style>
