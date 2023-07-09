<script setup lang="ts">
import { ref } from 'vue'
import playersComponent from './players/playersComponent.vue'
import matchesComponent from './matches/matchesComponent.vue'
import calendarComponent from './calendar/calendarComponent.vue'
import tournamentsComponent from './tournaments/tournamentsComponent.vue'

const tabSelected = ref(0)
const tabs = ['players', 'tournaments', 'calendar', 'matches']
</script>

<template>
    <v-card id="backoffice">
        <v-tabs v-model="tabSelected">
            <v-tab v-for="tab in tabs" :key="`tab${tab}`" :value="tab">
                {{ tab }}
            </v-tab>
        </v-tabs>

        <v-card-text>
            <v-window v-model="tabSelected">
                <v-window-item :value="tabs[0]">
                    <players-component />
                </v-window-item>
                <v-window-item :value="tabs[1]">
                    <tournaments-component />
                </v-window-item>
                <v-window-item :value="tabs[2]">
                    <calendar-component />
                </v-window-item>
                <v-window-item :value="tabs[3]">
                    <matches-component />
                </v-window-item>
            </v-window>
        </v-card-text>
    </v-card>
</template>

<style lang="scss">
#backoffice .v-data-table {
    border: 0;
}
</style>
