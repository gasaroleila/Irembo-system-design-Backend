import nodeCron from "node-cron";
const { schedule } = nodeCron;

export default function(time,task){
    schedule(time,task)
}