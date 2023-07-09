<script setup lang="ts">
import { MatchState } from 'core/enums'
import { ref } from 'vue'
import { useMatchesStore } from '@/stores/matchesStore'
import { reactive } from 'vue'
import { computed } from 'vue'

const initialFormState = () => ({
    _id: '',
    state: undefined as unknown as MatchState
})

const rules = {
    state: [
        (v: MatchState) => !!v || 'State is required',
        (v: MatchState) => Object.values(MatchState).includes(v) || 'State is incorrect'
    ]
}

const opened = ref(false)
const formValid = ref(false)
const error = ref('')
const loading = ref(false)

let match = reactive(initialFormState())
const showError = computed(() => error.value !== '')

const edit = (m: { state: MatchState; _id: string }) => {
    match = Object.assign({}, m)
    opened.value = true
}

const update = () => {
    loading.value = true
    useMatchesStore()
        .updateState(match._id, match.state)
        .then(() => {
            opened.value = false
            match = Object.assign({}, initialFormState())
        })
        .catch((err: any) => {
            console.log(err)
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
        <v-card>
            <v-card-title class="text-center"> Change match state </v-card-title>
            <v-card-text>
                <v-form v-model="formValid" validate-on="submit">
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <v-select
                                    v-model="match.state"
                                    label="State"
                                    :items="Object.values(MatchState).map((state: MatchState) => ({id: state, text: state}))"
                                    item-title="text"
                                    item-value="id"
                                    variant="underlined"
                                    hide-details="auto"
                                    :rules="rules.state"
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
                    @click="update()"
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
