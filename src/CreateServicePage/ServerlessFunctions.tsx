import React, { useState } from 'react'
import { Input, Select, InputNumber, Button, Checkbox } from 'antd'
import { Stages } from './Stages'
import { addService } from '../asyncData'
import { CloudFormationsStages } from './CloudFormationsStages'
const { Option } = Select

type Props = {
  source: string
  awsProfile: string
  cwd: string
  print: string
  offset: number
  stages: string[]
  region: string
  title?: string
  stacks?: [{ stage: string; stackName: string }]
}

export function ServerlessFunctions(props: Props) {
  const [source, setSource] = useState(props.source)
  const [awsProfile, setAwsProfile] = useState(props.awsProfile)
  const [title, setTitle] = useState(props.title)
  const [cfTitle, setCfTitle] = useState(props.title)
  const [useSlsTitle, setUseSlsTitle] = useState(!Boolean(props.title))
  const [cwd, setCwd] = useState(props.cwd)
  const [print, setPrint] = useState(props.print)
  const [offset, setOffset] = useState(props.offset)
  const [stages, setStages] = useState(props.stages)
  const [stacks, setStacks] = useState({} as any)
  const [errors, setErrors] = useState([])
  const [errorsDesc, setErrorsDesc] = useState([])

  let textInput: any = React.createRef()

  const onSubmit = async e => {
    let errorsTemp = []
    let errorsDescTemp = []

    if (!awsProfile) {
      errorsTemp.push('awsProfile')
      errorsDescTemp.push('AWS Profile is required')
    }

    if (source === 'serverless') {
      if (!print) {
        errorsTemp.push('print')
        errorsDescTemp.push('Print command is required')
      }
      if (!cwd) {
        errorsTemp.push('cwd')
        errorsDescTemp.push('Relative directory is required')
      }
      if (!title && !useSlsTitle) {
        errorsTemp.push('title')
        errorsDescTemp.push('Title is required')
      }
      if (stages.length === 0) {
        errorsTemp.push('stages')
        errorsDescTemp.push('At least one stage must be defined')
      }

      if (errorsDescTemp.length === 0) {
        try {
          await addService({
            source,
            awsProfile,
            cwd,
            print,
            offset,
            stages,
            stacks,
            title
          })
        } catch (err) {
          errorsDescTemp.push(err.message)
        }
      }
    } else if (source === 'cloudformation') {
      if (!cfTitle) {
        errorsTemp.push('cfTitle')
        errorsDescTemp.push('Title is required')
      }

      if (stacks.length === 0) {
        errorsDescTemp.push('At least one stage must be defined')
      }
      if (stacks.length && stacks.find(s => !s.stackName)) {
        const stack = stacks.find(s => !s.stackName)
        errorsDescTemp.push(`Missing stack name in stage ${stack.title}`)
      }

      if (errorsDescTemp.length === 0) {
        try {
          await addService({
            source,
            awsProfile,
            offset,
            stacks,
            title: cfTitle
          })
        } catch (err) {
          errorsDescTemp.push(err.message)
        }
      }
    }

    if (errorsDescTemp.length === 0) {
      setSource(props.source)
      setAwsProfile(props.awsProfile)
      setTitle(props.title)
      setCfTitle(props.title)
      setUseSlsTitle(!Boolean(props.title))
      setCwd(props.cwd)
      setPrint(props.print)
      setOffset(props.offset)
      setStages(props.stages)
    }

    setErrors(errorsTemp)
    setErrorsDesc(errorsDescTemp)
    e.target.blur()
  }
  return (
    <div>
      <table className="form-table">
        <tr>
          <td className="td-left">Source</td>
          <td>
            <Select
              defaultValue={source}
              className={errors.includes('source') && 'error'}
              style={{ width: '100%' }}
              onChange={setSource}
            >
              <Option value="serverless">Serverless Framework (AWS)</Option>
              <Option value="cloudformation">CloudFormation (AWS)</Option>
            </Select>
          </td>
        </tr>
        <tr>
          <td className="td-left">AWS Profile</td>
          <td>
            <Input
              className={errors.includes('awsProfile') && 'error'}
              value={awsProfile}
              onChange={e => setAwsProfile(e.target.value)}
            />
          </td>
        </tr>
        <tr>
          <td className="td-left">Time offset (minutes)</td>
          <td>
            <InputNumber
              className={errors.includes('offset') && 'error'}
              value={offset}
              onChange={offset => {
                setOffset(typeof offset === 'number' ? offset : 0)
              }}
            />
          </td>
        </tr>
        {source === 'serverless' && [
          <tr>
            <td className="td-left">Title</td>
            <td>
              <Checkbox
                className="config-title"
                style={{ opacity: useSlsTitle ? 1 : 0.5 }}
                checked={useSlsTitle}
                onChange={e => {
                  setUseSlsTitle(e.target.checked)
                  textInput.current.focus()
                }}
              >
                Same as the service name
              </Checkbox>

              <Input
                className={
                  errors.includes('title')
                    ? 'error custom-title'
                    : 'custom-title'
                }
                style={{ opacity: useSlsTitle ? 0 : 1 }}
                ref={textInput}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </td>
          </tr>,
          <tr>
            <td className="td-left">Relative directory</td>
            <td>
              <Input
                className={errors.includes('cwd') && 'error'}
                value={cwd}
                onChange={e => {
                  setCwd(e.target.value || './')
                }}
              />
            </td>
          </tr>,
          <tr>
            <td className="td-left">Print command</td>
            <td>
              <Input
                className={errors.includes('print') && 'error'}
                value={print}
                onChange={e => setPrint(e.target.value)}
              />
            </td>
          </tr>,

          <tr>
            <td className="td-left">Stages</td>
            <td className={errors.includes('stages') && 'error'}>
              <Stages stages={stages} onStagesChange={setStages} />
            </td>
          </tr>
        ]}
        {source === 'cloudformation' && [
          <tr>
            <td className="td-left">Title</td>
            <td>
              <Input
                className={errors.includes('cfTitle') && 'error'}
                placeholder="Service Title"
                value={cfTitle}
                onChange={e => setCfTitle(e.target.value)}
              />
            </td>
          </tr>,
          <tr>
            <td colSpan={2}>
              <CloudFormationsStages
                awsProfile={awsProfile}
                defaultStages={props.stacks}
                defaultRegion={props.region}
                onChange={stacks => {
                  setStacks(stacks)
                }}
              />
            </td>
          </tr>
        ]}
      </table>
      <Button className="submit-button" onClick={onSubmit}>
        Add Service
      </Button>
      <div className="error-desc-wrap">
        {errorsDesc.map((errorDesc, i) => (
          <p key={i}>{errorDesc}</p>
        ))}
      </div>
    </div>
  )
}
