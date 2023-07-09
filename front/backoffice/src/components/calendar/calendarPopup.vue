<script setup lang="ts">
import { ref } from 'vue'
import { VDatePicker } from 'vuetify/labs/components'
import { mdiCalendar } from '@mdi/js'
import { useCalendarStore } from '@/stores/calendarStore'
import { watch } from 'vue'
import { reactive } from 'vue'
import { computed } from 'vue'
import type { ICalendar } from 'core/interfaces'

const initialFormState = (): ICalendar =>
    ({
        _id: undefined as any,
        tournament: undefined as any,
        startDate: '',
        endDate: '',
        prizeMoney: 0 as number
    } as ICalendar)

const rules = {
    startDate: [(v: string) => !!v || 'Start date is required'],
    endDate: [(v: string) => !!v || 'End date is required'],
    tournament: [(v: string) => !!v || 'Tournament is required'],
    prizeMoney: [
        (v: number) => !!v || 'The prize money is required',
        (v: number) => Number(v) > 0 || 'The prize money can not be lesser than 0'
    ]
}

const opened = ref(false)
const startDateOpened = ref(false)
const endDateOpened = ref(false)
const formValid = ref(false)
const error = ref('')
const startDate = ref()
const endDate = ref()
const loading = ref(false)

let calendar = reactive(initialFormState())
const showError = computed(() => error.value !== '')
const tournaments = computed(() => useCalendarStore().getTournaments)

const edit = (p: ICalendar) => {
    calendar = Object.assign({}, p)
    opened.value = true
}

const save = () => {
    loading.value = true
    if (calendar._id?.toString().length) {
        update()
    } else {
        create()
    }
}

const create = () => {
    useCalendarStore()
        .createCalendar(calendar)
        .then(() => {
            opened.value = false
            calendar = Object.assign({}, initialFormState())
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
    useCalendarStore()
        .updateCalendar(calendar)
        .then(() => {
            opened.value = false
            calendar = Object.assign({}, initialFormState())
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

watch(startDate, (val) => {
    const date = new Date(val[0])
    calendar.startDate = date.toISOString().substring(0, 10)
})

watch(endDate, (val) => {
    const date = new Date(val[0])
    calendar.endDate = date.toISOString().substring(0, 10)
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
                {{ calendar._id?.toString().length ? `Edit Calendar` : 'Create a new calendar' }}
            </v-card-title>
            <v-card-text>
                <v-form v-model="formValid" validate-on="submit">
                    <v-container>
                        <v-row>
                            <v-col cols="6">
                                <v-autocomplete
                                    v-model="calendar.tournament"
                                    label="Tournament"
                                    :items="tournaments"
                                    item-title="name"
                                    item-value="_id"
                                    variant="underlined"
                                    hide-details="auto"
                                    :rules="rules.tournament"
                                    validate-on="input"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="calendar.prizeMoney"
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
                        <v-row>
                            <v-col cols="6">
                                <v-dialog class="date" v-model="startDateOpened" persistent>
                                    <template v-slot:activator="props">
                                        <v-text-field
                                            v-model="calendar.startDate"
                                            v-bind="props"
                                            label="Start date"
                                            variant="underlined"
                                            clearable
                                            density="compact"
                                            hide-details="auto"
                                            :append-inner-icon="mdiCalendar"
                                            readonly
                                            @click:append-inner="startDateOpened = true"
                                            :rules="rules.startDate"
                                            validate-on="input"
                                        />
                                    </template>
                                    <v-date-picker
                                        v-model="startDate"
                                        @click:save="startDateOpened = false"
                                        @click:cancel="startDateOpened = false"
                                        title="Start date"
                                        hide-details="auto"
                                    />
                                </v-dialog>
                            </v-col>
                            <v-col cols="6">
                                <v-dialog class="date" v-model="endDateOpened" persistent>
                                    <template v-slot:activator="props">
                                        <v-text-field
                                            v-model="calendar.endDate"
                                            v-bind="props"
                                            label="End date"
                                            variant="underlined"
                                            clearable
                                            density="compact"
                                            hide-details="auto"
                                            :append-inner-icon="mdiCalendar"
                                            readonly
                                            @click:append-inner="endDateOpened = true"
                                            :rules="rules.endDate"
                                            validate-on="input"
                                        />
                                    </template>
                                    <v-date-picker
                                        v-model="endDate"
                                        @click:save="endDateOpened = false"
                                        @click:cancel="endDateOpened = false"
                                        title="End date"
                                        hide-details="auto"
                                    />
                                </v-dialog>
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
.date .v-overlay__content {
    align-items: center;

    .v-picker__header {
        display: none;
    }
}
</style>
