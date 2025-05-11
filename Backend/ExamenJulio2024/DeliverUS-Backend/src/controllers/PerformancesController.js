import { Performances } from "../models/models"

const create = async function (req, res) {
    const newPerformance = Performances.build(req.body)
    try {
        await newPerformance.save()
        res.json(newPerformance)
    }catch(err){
        res.status(500).send(err)
    }
}

const PerformancesController = {
    create
}

export default PerformancesController