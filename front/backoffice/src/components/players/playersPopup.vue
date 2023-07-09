<script setup lang="ts">
import { Country, PlayerBackhand, PlayerCategory, PlayerMainHand } from 'core/enums'
import { ref } from 'vue'
import { VDatePicker } from 'vuetify/labs/components'
import { mdiCalendar } from '@mdi/js'
import { usePlayersStore } from '@/stores/playersStore'
import { watch } from 'vue'
import { reactive } from 'vue'
import { computed } from 'vue'
import type { IPlayer } from 'core/interfaces'

const initialFormState = (): IPlayer =>
    ({
        _id: '',
        infos: {
            lastName: '',
            firstName: '',
            dateOfBirth: '',
            country: undefined as unknown as Country,
            category: undefined as unknown as PlayerCategory,
            picture: ''
        },
        style: {
            backhand: undefined as unknown as PlayerBackhand,
            mainHand: undefined as unknown as PlayerMainHand
        },
        proSince: undefined as unknown as number
    } as IPlayer)

const rules = {
    firstName: [
        (v: string) => !!v || 'First name is required',
        (v: string) =>
            !!(!!v && /^[\p{L}\p{M}]+[\p{L}\p{M}' -]*[\p{L}\p{M}]+$/gmu.exec(v.trim())) ||
            'First name is incorrect'
    ],
    lastName: [
        (v: string) => !!v || 'Last name is required',
        (v: string) =>
            !!(!!v && /^[\p{L}\p{M}]+[\p{L}\p{M}' -]*[\p{L}\p{M}]+$/gmu.exec(v.trim())) ||
            'Last name is incorrect'
    ],
    country: [
        (v: Country) => !!v || 'Nationality is required',
        (v: Country) => Object.values(Country).includes(v) || 'Nationality is incorrect'
    ],
    category: [
        (v: PlayerCategory) => !!v || 'Category is required',
        (v: PlayerCategory) => Object.values(PlayerCategory).includes(v) || 'Category is incorrect'
    ],
    date: [(v: string) => !!v || 'Date of birth is required'],
    url: [
        (v: string) => !!v || 'The url of the picture is required',
        (v: string) =>
            !!(
                !!v &&
                /^(http(s):\/\/.)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/gm.exec(
                    v.trim()
                )
            ) || 'The url is incorrect'
    ],
    proSince: [
        (v: number) => !!v || 'The year is required',
        (v: number) =>
            Number(v) <= Number(new Date().toISOString().substring(0, 4)) ||
            'The year can not be greater than ' + Number(new Date().toISOString().substring(0, 4)),
        (v: number) => Number(v) > 1900 || 'The year can not be lesser than 1900'
    ],
    mainHand: [
        (v: PlayerMainHand) => !!v || 'Main hand is required',
        (v: PlayerMainHand) => Object.values(PlayerMainHand).includes(v) || 'Main hand is incorrect'
    ],
    backhand: [
        (v: PlayerBackhand) => !!v || 'Backhand type is required',
        (v: PlayerBackhand) =>
            Object.values(PlayerBackhand).includes(v) || 'Backhand type is incorrect'
    ]
}

const opened = ref(false)
const datepickerOpened = ref(false)
const formValid = ref(false)
const error = ref('')
const date = ref()
const loading = ref(false)

let player = reactive(initialFormState())
const showError = computed(() => error.value !== '')

const edit = (p: IPlayer) => {
    player = Object.assign({}, p)
    opened.value = true
}

const save = () => {
    loading.value = true
    if (player._id?.toString().length) {
        update()
    } else {
        create()
    }
}

const create = () => {
    usePlayersStore()
        .createPlayer(player)
        .then(() => {
            opened.value = false
            player = Object.assign({}, initialFormState())
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
    usePlayersStore()
        .updatePlayer(player)
        .then(() => {
            opened.value = false
            player = Object.assign({}, initialFormState())
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

watch(date, (val) => {
    const date = new Date(val[0])
    player.infos.dateOfBirth = date.toISOString().substring(0, 10)
})

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
                    player._id?.toString().length
                        ? `Edit ${player.infos.firstName} ${player.infos.lastName}`
                        : 'Create a new player'
                }}
            </v-card-title>
            <v-card-text>
                <v-form v-model="formValid" validate-on="submit">
                    <v-container>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="player.infos.firstName"
                                    label="First name"
                                    variant="underlined"
                                    clearable
                                    density="compact"
                                    hide-details="auto"
                                    :rules="rules.firstName"
                                    validate-on="input"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="player.infos.lastName"
                                    label="Last name"
                                    variant="underlined"
                                    clearable
                                    density="compact"
                                    hide-details="auto"
                                    :rules="rules.firstName"
                                    validate-on="input"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                                <v-select
                                    v-model="player.infos.country"
                                    label="Nationality"
                                    :items="Object.values(Country)"
                                    variant="underlined"
                                    hide-details="auto"
                                    :rules="rules.country"
                                    validate-on="input"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-select
                                    v-model="player.infos.category"
                                    label="Category"
                                    :items="Object.values(PlayerCategory)"
                                    variant="underlined"
                                    hide-details="auto"
                                    :rules="rules.category"
                                    validate-on="input"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                                <v-dialog class="dateOfBirth" v-model="datepickerOpened" persistent>
                                    <template v-slot:activator="props">
                                        <v-text-field
                                            v-model="player.infos.dateOfBirth"
                                            v-bind="props"
                                            label="Date of birth"
                                            variant="underlined"
                                            clearable
                                            density="compact"
                                            hide-details="auto"
                                            :append-inner-icon="mdiCalendar"
                                            readonly
                                            @click:append-inner="datepickerOpened = true"
                                            :rules="rules.date"
                                            validate-on="input"
                                        />
                                    </template>
                                    <v-date-picker
                                        v-model="date"
                                        @click:save="datepickerOpened = false"
                                        @click:cancel="datepickerOpened = false"
                                        title="Date of birth"
                                        hide-details="auto"
                                    />
                                </v-dialog>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="player.infos.picture"
                                    label="Picture URL"
                                    variant="underlined"
                                    clearable
                                    density="compact"
                                    hide-details="auto"
                                    :rules="rules.url"
                                    validate-on="input"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="player.proSince"
                                    type="number"
                                    label="Pro since"
                                    variant="underlined"
                                    clearable
                                    density="compact"
                                    hide-details="auto"
                                    :rules="rules.proSince"
                                    validate-on="input"
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                                <v-select
                                    v-model="player.style.mainHand"
                                    label="Main hand"
                                    :items="Object.values(PlayerMainHand)"
                                    variant="underlined"
                                    hide-details="auto"
                                    :rules="rules.mainHand"
                                    validate-on="input"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-select
                                    v-model="player.style.backhand"
                                    label="Backhand"
                                    :items="Object.values(PlayerBackhand)"
                                    variant="underlined"
                                    hide-details="auto"
                                    :rules="rules.backhand"
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

<style>
.dateOfBirth .v-overlay__content {
    align-items: center;

    .v-picker__header {
        display: none;
    }
}
</style>
