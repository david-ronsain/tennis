<script setup lang="ts">
import { Country, TournamentCategory, TournamentSurface } from 'core/enums'
import { ref } from 'vue'
import { useTournamentsStore } from '@/stores/tournamentsStore'
import { reactive } from 'vue'
import { computed } from 'vue'
import type { ITournament } from 'core/interfaces'

const initialFormState = (): ITournament =>
    ({
        _id: '',
        creationYear: undefined as unknown as number,
        name: '',
        category: undefined as unknown as TournamentCategory,
        prizeMoney: undefined as unknown as number,
        country: undefined as unknown as Country,
        surface: undefined as unknown as TournamentSurface
    } as ITournament)

const rules = {
    creationYear: [
        (v: number) => !!v || 'The creation year is required',
        (v: number) =>
            Number(v) <= Number(new Date().toISOString().substring(0, 4)) ||
            'The creation year can not be greater than ' +
                Number(new Date().toISOString().substring(0, 4)),
        (v: number) => Number(v) > 1800 || 'The creation year can not be lesser than 1800'
    ],
    name: [
        (v: string) => !!v || 'Name is required',
        (v: string) =>
            !!(!!v && /^[\p{L}\p{M}]+[\p{L}\p{M}' -]*[\p{L}\p{M}]+$/gmu.exec(v.trim())) ||
            'Name is incorrect'
    ],
    category: [
        (v: TournamentCategory) => !!v || 'Category is required',
        (v: TournamentCategory) =>
            Object.values(TournamentCategory).includes(v) || 'Category is incorrect'
    ],
    prizeMoney: [
        (v: number) => !!v || 'The prize money is required',
        (v: number) => Number(v) > 0 || 'The prize money can not be lesser than 0'
    ],
    country: [
        (v: Country) => !!v || 'Nationality is required',
        (v: Country) => Object.values(Country).includes(v) || 'Nationality is incorrect'
    ],
    surface: [
        (v: TournamentSurface) => !!v || 'Surface is required',
        (v: TournamentSurface) =>
            Object.values(TournamentSurface).includes(v) || 'Surface is incorrect'
    ]
}

const opened = ref(false)
const formValid = ref(false)
const error = ref('')
const loading = ref(false)

let tournament = reactive(initialFormState())
const showError = computed(() => error.value !== '')

const edit = (p: ITournament) => {
    tournament = Object.assign({}, p)
    opened.value = true
}

const save = () => {
    loading.value = true
    if (tournament._id?.toString().length) {
        update()
    } else {
        create()
    }
}

const create = () => {
    useTournamentsStore()
        .createTournament(tournament)
        .then(() => {
            opened.value = false
            tournament = Object.assign({}, initialFormState())
        })
        .catch((err: any) => {
            if (err.response.data?.httpCode === 400 && err.response.data?.validationFailed) {
                error.value = err.response.data.validationFailed.map(
                    (message: string) => '- ' + message + '<br/>'
                )
            } else {
                error.value = err.message + JSON.stringify(err.response.data)
            }
        })
        .finally(() => {
            loading.value = false
        })
}

const update = () => {
    useTournamentsStore()
        .updateTournament(tournament)
        .then(() => {
            opened.value = false
            tournament = Object.assign({}, initialFormState())
        })
        .catch((err: any) => {
            if (err.response.data?.httpCode === 400 && err.response.data?.validationFailed) {
                error.value = err.response.data.validationFailed.map(
                    (message: string) => '- ' + message + '<br/>'
                )
            } else {
                error.value = err.message + JSON.stringify(err.response.data)
            }
        })
        .finally(() => {
            loading.value = false
        })
}

defineExpose({
    edit
})
</script>

<template>
    <v-dialog v-model="opened" max-width="500px" min-width="400px">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props"> Create </v-btn>
        </template>
        <v-card>
            <v-card-title class="text-center">
                {{
                    tournament._id?.toString().length
                        ? `Edit ${tournament.name}`
                        : 'Create a new tournament'
                }}
            </v-card-title>
            <v-card-text>
                <v-form v-model="formValid" validate-on="submit">
                    <v-container>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="tournament.name"
                                    label="Name"
                                    variant="underlined"
                                    clearable
                                    density="compact"
                                    hide-details="auto"
                                    :rules="rules.name"
                                    validate-on="input"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="tournament.creationYear"
                                    type="number"
                                    label="Creation year"
                                    variant="underlined"
                                    clearable
                                    density="compact"
                                    hide-details="auto"
                                    :rules="rules.creationYear"
                                    validate-on="input"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                                <v-select
                                    v-model="tournament.category"
                                    label="Category"
                                    :items="Object.values(TournamentCategory)"
                                    variant="underlined"
                                    density="compact"
                                    hide-details="auto"
                                    :rules="rules.category"
                                    validate-on="input"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-select
                                    v-model="tournament.surface"
                                    label="Surface"
                                    :items="Object.values(TournamentSurface)"
                                    variant="underlined"
                                    density="compact"
                                    hide-details="auto"
                                    :rules="rules.surface"
                                    validate-on="input"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                                <v-select
                                    v-model="tournament.country"
                                    label="Country"
                                    :items="Object.values(Country)"
                                    variant="underlined"
                                    density="compact"
                                    hide-details="auto"
                                    :rules="rules.country"
                                    validate-on="input"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="tournament.prizeMoney"
                                    label="Prize money"
                                    variant="underlined"
                                    clearable
                                    density="compact"
                                    hide-details="auto"
                                    :rules="rules.prizeMoney"
                                    validate-on="input"
                                />
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-alert
                        closable
                        density="compact"
                        type="error"
                        v-model="showError"
                        @click:close="error = ''"
                    >
                        <div v-html="error" />
                    </v-alert>
                </v-form>
            </v-card-text>
            <v-card-actions class="d-flex align-center justify-space-between">
                <v-btn variant="text" @click="opened = false" :disabled="loading"> Cancel </v-btn>
                <v-btn
                    variant="text"
                    @click="save()"
                    :disabled="loading || !formValid"
                    :loading="loading"
                >
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
